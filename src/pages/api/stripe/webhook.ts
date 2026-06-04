import type { APIRoute } from 'astro';
import { subscribe } from '../../../../backend/backend.mjs';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
    try {
        // 1. Récupération robuste des clés (Compatible Astro + Netlify Node.js)
        // Note : On utilise (import.meta.env as any) pour éviter les alertes TypeScript si process.env est détecté
        const stripeKey = import.meta.env.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : null);
        const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || (typeof process !== 'undefined' ? process.env.STRIPE_WEBHOOK_SECRET : null);

        if (!stripeKey || !endpointSecret) {
            return new Response(
                JSON.stringify({ error: "Clés Stripe introuvables sur le serveur de production." }),
                { status: 501, headers: { 'Content-Type': 'application/json' } } // 501 = Erreur de configuration
            );
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16', // Fortement recommandé par Stripe pour éviter les bugs de versionnage
        });

        // 2. Lecture du body et de la signature
        const rawBody = await request.text();
        const sig = request.headers.get('stripe-signature');

        if (!sig) {
            return new Response(
                JSON.stringify({ error: "En-tête stripe-signature manquant." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let event: Stripe.Event;

        // 3. Vérification cryptographique
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: `Signature invalide: ${err.message}` }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 4. Traitement de l'abonnement
        if (event.type === 'invoice.payment_succeeded') {
            // On utilise "any" car les types TypeScript de Stripe ne connaissent peut-être pas encore cette structure
            const invoice = event.data.object as any;

            // 💡 1. On va chercher le subscriptionId là où il est VRAIMENT rangé
            const subscriptionId = invoice.parent?.subscription_details?.subscription || invoice.subscription;

            // 💡 2. On récupère le userId directement depuis le JSON (plus besoin de l'API Stripe !)
            const userId = invoice.parent?.subscription_details?.metadata?.userId || invoice.lines?.data?.[0]?.metadata?.userId;

            if (subscriptionId && userId) {
                try {
                    const periodEndTimestamp = invoice.lines?.data?.[0]?.period?.end;

                    if (!periodEndTimestamp) {
                        throw new Error("Date de fin introuvable dans la facture");
                    }

                    const expirationDate = new Date(periodEndTimestamp * 1000);

                    // Appel à ton backend PocketBase
                    await subscribe(userId, expirationDate);

                } catch (internalError: any) {
                    return new Response(
                        JSON.stringify({
                            error: "Crash lors du traitement en BDD",
                            details: internalError?.message || String(internalError)
                        }),
                        { status: 502, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            } else {
                // Si on n'a ni abonnement ni utilisateur, on le signale pour le debug
                return new Response(
                    JSON.stringify({
                        warning: "Événement reçu mais userId ou subscriptionId introuvable dans le JSON."
                    }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Succès total
        return new Response(
            JSON.stringify({ received: true, event: event.type }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (globalError: any) {
        // En cas de crash total et inattendu du fichier entier
        return new Response(
            JSON.stringify({ error: "Crash serveur global", details: globalError?.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};