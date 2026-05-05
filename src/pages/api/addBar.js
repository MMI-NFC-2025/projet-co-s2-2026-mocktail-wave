import { addBar } from '../../../backend/backend.mjs';

export async function POST({ request }) {
    try {
        const data = await request.json();
        const bar = await addBar(data);
        return new Response(JSON.stringify({ success: true, bar }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
