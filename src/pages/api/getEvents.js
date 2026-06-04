import { pb } from "../../../backend/backend.mjs";

export async function POST(context) {
    try {
        const { leader_of = [], member_of = [] } = await context.request.json();
        const ids = [...leader_of, ...member_of];

        console.log("IDs reçus :", ids);

        if (ids.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        const filterString = ids.map(id => `id = "${id}"`).join(" || ");
        console.log("Filtre généré :", filterString);

        const events = await pb.collection("events").getFullList({
            filter: filterString,
            expand: 'leader'
        });

        console.log("Événements trouvés :", events);

        return new Response(JSON.stringify(events), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        const statusCode = err.status || 500;
        return new Response(JSON.stringify({
            error: err.message || "Erreur lors de la récupération des événements"
        }), {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        });
    }
}