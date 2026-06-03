import PocketBase from 'pocketbase';
export const pb = new PocketBase('https://mocktailwave.taverne-etudiante.fr');

export async function getUser(id) {
    try {
        const result = await pb.collection('users').getOne(id);
        return result;
    } catch (err) {
        throw err;
    }
}

export async function getFriendList(id) {
    try {
        const result = await pb.collection('users').getOne(id, { expand: 'friends' });
        return result.expand?.friends;
    } catch (err) {
        throw err;
    }
}

export async function getUserbyTag(tag) {
    try {
        const result = await pb.collection('users').getFirstListItem(`tag = "${tag}"`);
        return result;
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function getEvent(id) {
    try {
        const result = await pb.collection('events').getOne(id, {
            expand: 'bars,members',
        });

        return result;
    } catch (err) {
        console.error("Erreur lors de la récupération de l'événement:", err);
        throw err;
    }
}

export async function addParticipantToEvent(eventId, userId) {
    const soiree = await pb.collection("events").getOne(eventId);
    const currentParticipantIds = soiree.members || [];

    if (currentParticipantIds.includes(userId)) {
        throw new Error("already_in_event");
    }

    const updatedIds = [...currentParticipantIds, userId];

    const event = await pb.collection("events").update(eventId, {
        members: updatedIds,
    });

    return event;
}

export async function Userauth(login, mdp) {
    try {
        const authData = await pb.collection('users').authWithPassword(login, mdp);
        console.log("Utilisateur connecté :", pb.authStore.record.id);
        return authData;
    } catch (error) {
        console.error("Erreur de connexion :", error.message);
        return null;
    }
}

export async function createUser(email, password, passwordConfirm, name, prename, pseudo, date) {
    console.log(email, password, passwordConfirm, name, prename, pseudo, date);
    let randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    let tag = `${pseudo}#${randomNumber}`;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;
    while (await getUserbyTag(tag) && attempts < MAX_ATTEMPTS) {
        randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        tag = `${pseudo}#${randomNumber}`;
        attempts++;
    }
    if (attempts >= MAX_ATTEMPTS) {
        throw new Error("Impossible de générer un tag unique. Essayez un autre pseudo.");
    }
    try {
        const data = {
            "email": email,
            "emailVisibility": true,
            "password": password,
            "passwordConfirm": passwordConfirm,
            "name": name,
            "prename": prename,
            "pseudo": pseudo,
            "born_date": date,
            "tag": tag,
            "nameConf": 'public',
            "eventsConf": 'amis',

        };
        const record = await pb.collection('users').create(data);
        return record;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function isLogged() {
    return pb.authStore.record;
}

export function logout() {
    pb.authStore.clear();
    console.log("Utilisateur déconnecté");
}

export async function updateUserInfo(data) {
    try {
        const user = pb.authStore.record;
        if (!user) throw new Error("Non connecté");

        const record = await pb.collection('users').update(user.id, data);

        pb.authStore.save(pb.authStore.token, record);

        return record;
    } catch (error) {
        console.error("Erreur update :", error.message);
        throw error;
    }
}
export async function addFriendID(receiverTagId) {
    const sendBy = pb.authStore.record;
    if (!sendBy) throw new Error("Non connecté");

    let sendTo;
    try {
        sendTo = await pb.collection('users').getOne(receiverTagId);
    } catch (err) {
        throw new Error("Utilisateur introuvable");
    }

    if (sendTo.id === sendBy.id) {
        throw new Error("Autiste de merde");
    }

    const hisReceiveRequests = sendTo.receiveFriendRequest || [];
    const hisFriends = sendTo.friends || [];
    const myReceiveRequests = sendBy.receiveFriendRequest || [];

    if (hisReceiveRequests.includes(sendBy.id)) {
        throw new Error("Demande déjà envoyée !");
    }

    if (hisFriends.includes(sendBy.id)) {
        throw new Error("Déjà amis !");
    }

    if (myReceiveRequests.includes(sendTo.id)) {
        await pb.collection('users').update(sendBy.id, {
            "friends+": sendTo.id,
            "receiveFriendRequest-": sendTo.id
        });
        await pb.collection('users').update(sendTo.id, {
            "friends+": sendBy.id
        });
        return "Amis ajoutés";
    }

    await pb.collection('users').update(sendTo.id, {
        "receiveFriendRequest+": sendBy.id
    });

    return "Demande envoyée";
}
export async function addFriend(receiverTag) {
    const sendBy = pb.authStore.record;
    const TAG_REGEX = /^[^#]+#\d{4}$/;
    if (!sendBy) throw new Error("Non connecté");

    if (!TAG_REGEX.test(receiverTag)) {
        throw new Error("Le format du tag est invalide (ex: Pseudo#1234)");
    }

    const sendTo = await getUserbyTag(receiverTag);

    const hisReceiveRequests = sendTo.receiveFriendRequest || [];
    const hisFriends = sendTo.friends || [];
    const myReceiveRequests = sendBy.receiveFriendRequest || [];

    if (!sendTo) throw new Error("Utilisateur introuvable");
    if (sendTo.id === sendBy.id)
        throw new Error("Autiste de merde");

    if (hisReceiveRequests.includes(sendBy.id)) {
        throw new Error("Demande déjà envoyée !");
    }

    if (hisFriends.includes(sendBy.id)) {
        throw new Error("Déjà amis !");
    }

    if (myReceiveRequests.includes(sendTo.id)) {
        await pb.collection('users').update(sendBy.id, {
            "friends+": sendTo.id,
            "receiveFriendRequest-": sendTo.id
        });
        await pb.collection('users').update(sendTo.id, {
            "friends+": sendBy.id
        });
        return "Amis ajoutés";
    }

    await pb.collection('users').update(sendTo.id, {
        "receiveFriendRequest+": sendBy.id
    });

    return "Demande envoyée";
}

export async function getFriends() {
    const user = pb.authStore.record;
    const fresh = await pb.collection('users').getOne(user.id, {
        expand: 'friends,receiveFriendRequest'
    });
    return {
        friends: fresh.expand?.friends || [],
        requests: fresh.expand?.receiveFriendRequest || []
    };
}

export async function deleteFriend(targetId) {
    const currentUser = pb.authStore.record;
    if (!currentUser || !targetId || currentUser.id === targetId) {
        throw new Error("Opération de suppression invalide");
    }

    try {
        await pb.collection('users').update(currentUser.id, {
            "friends-": targetId
        });

        await pb.collection('users').update(targetId, {
            "friends-": currentUser.id
        });

        const updatedRecord = await pb.collection('users').getOne(currentUser.id);
        pb.authStore.save(pb.authStore.token, updatedRecord);

        return "Ami supprimé avec succès";
    } catch (error) {
        console.error("Erreur lors de la suppression :", error.message);
        throw error;
    }
}

export async function getSocialData() {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    const fresh = await pb.collection('users').getOne(user.id, {
        expand: 'friends,receiveFriendRequest'
    });

    return {
        friends: fresh.expand?.friends || [],
        requests: fresh.expand?.receiveFriendRequest || []
    };
}

export async function declineRequest(senderId) {
    const currentUser = pb.authStore.record;
    if (!currentUser) throw new Error("Non connecté");
    console.log(senderId);
    await pb.collection('users').update(currentUser.id, {
        "receiveFriendRequest-": senderId
    });

    return "Demande refusée";
}

export async function getBars() {
    const bars = await pb.collection("bars").getFullList();
    return bars;
}

async function barExistsByOSMID(osmId) {
    const found = await pb.collection('bars')
        .getFirstListItem(`openStreetMapID = "${osmId}"`)
        .catch(e => null);
    return !!found;
}

export async function addBar(barData) {
    const exists = await barExistsByOSMID(barData.id);

    if (exists) {
        throw new Error("Ce bar figure déjà dans la liste.");
    }

    try {
        const data = {
            name: barData.name,
            themes: barData.themes,
            address: barData.address,
            lat: barData.lat,
            lng: barData.lng,
            imageUrl: barData.imageUrl,
            openStreetMapID: barData.id.toString()
        };

        const record = await pb.collection('bars').create(data);
        return record;
    } catch (error) {
        console.error("Erreur PocketBase create:", error);
        throw new Error(error.message);
    }
}
export async function createEvent({ bars }, leader) {
    if (!bars || !Array.isArray(bars) || bars.length === 0) {
        throw new Error("Aucun bar sélectionné");
    }

    const eventdata = {
        bars: bars,
        leader,
        "members+": leader,
        sam: leader,
        multi_bar: (bars.length > 1) ? true : false,
    };

    try {
        const event = await pb.collection('events').create(eventdata);

        const userData = {
            "leader_of+": event.id
        }
        return { userData, event };

    } catch (error) {
        if (error.data && error.data.data) {
            console.error("Détails de l'erreur PocketBase :", error.data.data);
            const firstErrorKey = Object.keys(error.data.data)[0];
            const firstErrorMessage = error.data.data[firstErrorKey].message;
            throw new Error(`Erreur sur le champ '${firstErrorKey}' : ${firstErrorMessage}`);
        }
        throw new Error(error.message || "Impossible de créer l'événement");
    }
}

export async function updateEventTitle(eventId, newTitle) {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    if (!newTitle || newTitle.trim() === "") {
        throw new Error("Le titre ne peut pas être vide");
    }

    return await pb.collection("events").update(eventId, {
        name: newTitle.trim()
    });
}

export async function updateEventDate(eventId, newDate) {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    if (!newDate) {
        throw new Error("La date ne peut pas être vide");
    }

    return await pb.collection("events").update(eventId, {
        date: newDate
    });
}
export async function updateEventSam(eventId, userId) {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    try {
        return await pb.collection("events").update(eventId, {
            sam: userId
        });
    } catch (err) {
        console.error("Erreur updateEventSam:", err);
        throw err;
    }
}

export async function updateEventLeader(eventId, userId) {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    try {
        return await pb.collection("events").update(eventId, {
            leader: userId
        });
    } catch (err) {
        console.error("Erreur updateEventLeader:", err);
        throw err;
    }
}

export async function removeParticipantFromEvent(eventId, userId) {
    const user = pb.authStore.record;
    if (!user) throw new Error("Non connecté");

    try {
        return await pb.collection("events").update(eventId, {
            "members-": userId
        });
    } catch (err) {
        console.error("Erreur removeParticipantFromEvent:", err);
        throw err;
    }
}

export async function setEventDateToNow(eventId) {
    if (!eventId) {
        throw new Error("L'identifiant de l'événement est requis.");
    }

    try {
        const nowIsoString = new Date().toISOString();

        const updatedEvent = await updateEventDate(eventId, nowIsoString);

        return updatedEvent;
    } catch (error) {
        console.error("Erreur dans setEventDateToNow :", error);
        throw error;
    }
}

export async function updateClassement(eventId) {
    // 1. récupérer event
    const event = await pb.collection("events").getOne(eventId, {
        expand: "members"
    });

    if (!event) throw new Error("Event introuvable");

    // 2. récupérer classement
    let classement;

    const existing = await pb.collection("classements").getList(1, 1, {
        filter: `event = "${eventId}"`
    });

    if (existing.items.length === 0) {
        const members = event.expand?.members || [];

        const users = {};

        members.forEach((u) => {
            users[u.id] = {
                points: 0,
                done: 0,
                last_challenge: null,
                cache_chrono: null,
                current_challenge: null,
                done_challenges: []
            };
        });

        classement = await pb.collection("classements").create({
            event: eventId,
            users
        });
        await pb.collection("events").update(eventId, {
            classement: classement.id
        });
    } else {
        classement = existing.items[0];
    }

    // 3. challenges
    const challenges = await pb.collection("challenges").getFullList();

    const TWO_HOURS = 1000 * 60 * 60 * 2;
    const now = Date.now();

    const users = classement.users || {};

    for (const userId in users) {
        const user = users[userId];

        const last = user.last_challenge
            ? new Date(user.last_challenge).getTime()
            : 0;

        const needNew = !user.last_challenge || now - last > TWO_HOURS;

        if (needNew) {
            const available = challenges.filter(
                (c) => !user.done_challenges.includes(c.id)
            );

            const pool = available.length ? available : challenges;

            const random = pool[Math.floor(Math.random() * pool.length)];

            user.current_challenge = random.id;
            user.last_challenge = new Date().toISOString();
        }
    }

    // 4. update classement
    await pb.collection("classements").update(classement.id, {
        users
    });

    return classement;
}

export async function validateChallenge(eventId) {
    const user = await isLogged();
    if (!user) throw new Error("Not logged in");

    const res = await pb.collection("classements").getFirstListItem(
        `event="${eventId}"`
    );

    const classement = res;
    const userData = classement.users?.[user.id];

    if (!userData) {
        throw new Error("User not in event");
    }

    if (!userData.current_challenge) {
        throw new Error("No active challenge");
    }

    const now = Date.now();
    const last = userData.cache_chrono
        ? new Date(userData.cache_chrono).getTime()
        : 0;

    const cooldown = 2 * 60 * 60 * 1000;
    const challengeEnd = last + cooldown;

    const gracePeriod = 20 * 60 * 1000;

    let gainedPoints = 1;
    if (now <= challengeEnd + gracePeriod) {
        gainedPoints = 2;
    }

    userData.done = (userData.done || 0) + 1;
    userData.points = (userData.points || 0) + gainedPoints;
    userData.cache_chrono = new Date().toISOString();

    userData.done_challenges = [
        ...(userData.done_challenges || []),
        userData.current_challenge,
    ];

    userData.last_challenge = new Date().toISOString();
    userData.current_challenge = null;

    await pb.collection("classements").update(classement.id, {
        users: classement.users,
    });

    return { success: true, gainedPoints };
}

export async function startEvent(eventId) {
    const event = await pb.collection("events").getOne(eventId);

    if (!event) throw new Error("Event introuvable");

    await pb.collection("events").update(eventId, {
        status: "ongoing",
        started_at: new Date().toISOString(),
    });

    // 2. créer classement si besoin
    await updateClassement(eventId);

    return true;
}

export async function loadMyChallenge(id, currentUser) {
    const classement = await pb
        .collection("classements")
        .getFirstListItem(`event="${id}"`);
    const me = classement?.users?.[currentUser.id];

    if (!me?.current_challenge) return null;

    return await pb
        .collection("challenges")
        .getOne(me.current_challenge);
}

export async function getClassement(eventId) {
    return pb
        .collection("classements")
        .getFirstListItem(`event="${eventId}"`);
}

export async function subscribe(id, end) {
    const sub = await pb.collection("abonnements").create({
        user: id,
        subEnd: end,
    });
    const user = await pb.collection('users').update(id, {
        sub: 'vkvrhdae8d3veu3',
        endSub: sub.id,
    });
    return user;
}