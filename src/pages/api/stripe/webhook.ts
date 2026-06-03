import type { APIRoute } from 'astro';
import { subscribe } from '../../../../backend/backend.mjs';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
        return new Response(JSON.stringify({ error: "Signature ou secret manquant" }), { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`❌ Échec de la vérification du Webhook: ${err.message}`);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
            try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const userId = subscription.metadata.userId;

                if (!userId) {
                    console.warn(`⚠️ Aucun userId trouvé dans les métadonnées de l'abonnement ${subscriptionId}`);
                    return new Response(JSON.stringify({ error: "userId manquant" }), { status: 400 });
                }

                console.log(`💰 Paiement réussi pour l'utilisateur : ${userId}`);
                const periodEndTimestamp = invoice.lines.data[0].period.end;
                const expirationDate = new Date(periodEndTimestamp * 1000);

                // 💡 AJOUT DU AWAIT ICI : On attend que la BDD ait fini son travail
                await subscribe(userId, expirationDate);

            } catch (dbError) {
                console.error("Erreur lors de la mise à jour en base de données:", dbError);
                return new Response(JSON.stringify({ error: "Erreur BDD" }), { status: 500 });
            }
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
};

export const REQ_LIMIT = {
    bodySizeLimit: '1mb',
};