import { barExistsByOSMID } from '../../../backend/backend.mjs';
export const GET = async ({ url }) => {
    try {
        const query = url.searchParams.get("q");
        if (!query || query.length < 2) return new Response(JSON.stringify([]));

        const searchLower = query.toLowerCase();

        // 1. Géocodage (on cible le Doubs)
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Doubs, France")}`,
            { headers: { 'User-Agent': 'MonAppDeBarsAstro/1.1 (mael.brungard@gmail.com)' } }
        );

        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) return new Response(JSON.stringify([]));

        const { lat, lon } = geoData[0];

        // 2. Appel Overpass
        const overpassQuery = `
            [out:json];
            area["ref"="25"]->.departement;
            (
              node["amenity"="bar"](around:5000, ${lat}, ${lon})(area.departement);
              node["amenity"="pub"](around:5000, ${lat}, ${lon})(area.departement);
            );
            out;
        `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: overpassQuery,
            headers: { 'User-Agent': 'MonAppDeBarsAstro/1.1' }
        });

        const data = await response.json();

        // 3. Formatage et Tri par Pertinence
        const bars = (data.elements || [])
            .filter(item => item.tags.name)
            .map(item => {
                const name = item.tags.name;
                const nameLower = name.toLowerCase();

                let score = 0;
                if (nameLower === searchLower) score = 100;
                else if (nameLower.startsWith(searchLower)) score = 80;
                else if (nameLower.includes(searchLower)) score = 50;
                return {
                    id: item.id.toString(),
                    name: name,
                    imageUrl: "http://localhost:4321/favicon.svg",
                    themes: "chill",
                    lat: item.lat,
                    lng: item.lon,
                    score: score,
                    address: `${item.tags["addr:housenumber"] || ""} ${item.tags["addr:street"] || item.tags["addr:place"] || ""}, ${item.tags["addr:postcode"] || ""} ${item.tags["addr:city"] || ""}`.replace(/\s+/g, ' ').trim()
                };
            })
            .sort((a, b) => b.score - a.score);

        return new Response(JSON.stringify(bars), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify([]), { status: 200 });
    }
};