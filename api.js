const fetch = require('node-fetch');

async function search(query) {
    let response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw`);
    return (await response.json())["data"];
}

async function getAnimeById(id) {
    let response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
    return (await response.json())["data"];
}

module.exports = { search, getAnimeById };