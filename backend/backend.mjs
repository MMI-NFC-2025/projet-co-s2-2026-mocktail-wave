import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');

export async function getUser(id) {
    const result = await pb.collection('users').getOne(id);
    return result;
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
            "emailConf": 'privee',
            "nameConf": 'public',
            "events": 'amis',

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

export async function deleteFriends(targetId) {
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