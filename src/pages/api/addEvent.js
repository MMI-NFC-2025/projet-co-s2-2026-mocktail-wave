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
        const statusCode = err.status || 400;

        return new Response(JSON.stringify({
            error: err.message || 'Erreur lors de la création de la soirée'
        }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
