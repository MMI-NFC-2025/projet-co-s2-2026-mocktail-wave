import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// On initialise Stripe avec la clé secrète stockée dans ton .env
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
    try {
        // 1. On récupère le body de la requête dans Astro
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ error: "L'ID de l'utilisateur est requis" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. Création de la session Stripe
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: 'price_1TeJbtQ6SaMPcJ8Ls0KyprwS', quantity: 1 }],

            subscription_data: {
                metadata: {
                    userId: id
                }
            },

            success_url: `${import.meta.env.SITE}/compte`,
            cancel_url: `${import.meta.env.SITE}/compte`,
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