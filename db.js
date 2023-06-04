const { createClient } = require("redis");
const client = createClient({
    url: process.env.REDIS_URL
});
client.on('error', err => console.log('Redis Client Error', err));

async function connectClient() {
    await client.connect();
}

async function getUserData(id) {
    id = id.toString();
    let data = await client.get(id);
    if (!data) {
        data = { language: "en", list: [] }
        setUserData(id, data);
    }
    else {
        data = JSON.parse(data);
        if (Array.isArray(data)) {
            data = { language: "en", list: [] }
            setUserData(id, data);
        }
    }
    return data;
}

async function setUserData(id, data) {
    id = id.toString();
    await client.set(id, JSON.stringify(data));
}

async function getUserList(id) { return (await getUserData(id)).list; }
async function setUserList(id, list) {
    let data = await getUserData(id);
    data.list = list;
    await setUserData(id, data);
}

async function addAnimeToList(id, animeId) {
    let list = await getUserList(id);
    if (!list.includes(animeId)) list.push(animeId);
    await setUserList(id, list);
}

async function removeAnimeFromList(id, animeId) {
    let list = await getUserList(id);
    const index = list.indexOf(animeId);
    if (index != -1) list.splice(index, 1);
    await setUserList(id, list);
}

async function getUserLanguage(id) { return (await getUserData(id)).language; }
async function setUserLanguage(id, language) {
    let data = await getUserData(id);
    data.language = language;
    await setUserData(id, data);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function switchLanguage(id) {
    let language = await getUserLanguage(id);
    if (language == "en") language = "ua";
    else language = "en";
    await setUserLanguage(id, language);
    await delay(1000);
}

module.exports = { connectClient, getUserList, addAnimeToList, removeAnimeFromList, getUserLanguage, switchLanguage };