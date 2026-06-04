import { createEvent } from '../../../backend/backend.mjs';

export async function POST(context) {
    try {
        const { bars, leader } = await context.request.json();
        const result = await createEvent({ bars }, leader);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error("Détail de l'erreur côté serveur :", err);

        let errorMessage = 'Erreur lors de la création de la soirée';

        if (typeof err === 'string') {
            errorMessage = err;
        } else if (err && typeof err === 'object') {
            if (err.data && err.data.message) {
                errorMessage = err.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = err.error;
            }
        }

        // 3. Traduction à la volée des erreurs de droits PocketBase si nécessaire
        if (errorMessage.includes("The requested resource wasn't found") || err.status === 403) {
            errorMessage = "Vous n'avez pas les autorisations nécessaires pour créer cette soirée.";
        }

        const statusCode = err.status || 400;

        return new Response(JSON.stringify({
            error: errorMessage
        }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}