import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
    try {
        console.log('start');
        const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
        console.log(import.meta.env.FRONTEND_URL);
        console.log(stripeKey);

        if (!stripeKey) {
            console.error("🚨 CRITIQUE : Clé Stripe introuvable en production !");
            return new Response(
                JSON.stringify({ error: "Erreur de configuration du serveur." }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const stripe = new Stripe(stripeKey);

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ error: "L'ID de l'utilisateur est requis" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: 'price_1TeJbtQ6SaMPcJ8Ls0KyprwS', quantity: 1 }],

            subscription_data: {
                metadata: {
                    userId: id
                }
            },

            success_url: `${import.meta.env.FRONTEND_URL}/account`,
            cancel_url: `${import.meta.env.FRONTEND_URL}/account`,
        });

        // 3. On renvoie la réponse au format Astro
        return new Response(
            JSON.stringify({ url: session.url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Erreur Stripe:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}