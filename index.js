const { Telegraf } = require("telegraf");

const { connectClient, getUserList, addAnimeToList, removeAnimeFromList, switchLanguage, getUserLanguage } = require("./db.js");
const { digitCount, escape, getCommandArgument, getCommandArgumentId, getLocalizedString, replyWithLocalizedString } = require("./util.js");
const { search, getAnimeById } = require("./api.js");

async function main() {
    await connectClient();
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN_EDU);

    bot.start(async (ctx) => await replyWithLocalizedString(ctx, "GREETING", ctx.from.first_name ? ctx.from.first_name : "User"));
    bot.help(async (ctx) => await replyWithLocalizedString(ctx, "HELP"));

    bot.command("search", async (ctx) => {
        const query = getCommandArgument(ctx.message.text);
        if (!query) { await replyWithLocalizedString(ctx, "EMPTY_QUERY"); return; }

        const data = (await search(query)).slice(0, 5);

        let msg = "";
        for (let i = 0; i < data.length; i++) {
            const { title, url, mal_id } = data[i];

            const precedingZeroes = '0'.repeat(6 - digitCount(mal_id));
            msg += `#${precedingZeroes}${mal_id}: [${title}]@(${url}@)\n`;
        }

        await replyWithLocalizedString(ctx, "SEARCH_RESULTS", query, msg);
    });

    bot.command("info", async (ctx) => {
        const id = getCommandArgumentId(ctx.message.text);
        if (!id) { await replyWithLocalizedString(ctx, "ID_INVALID_OR_EMPTY"); return; }

        try {
            let { title, title_japanese, url, images: { jpg: { image_url } }, synopsis, studios: [{ name: studio }] }
                = await getAnimeById(id);
            if (synopsis.length > 300) synopsis = synopsis.substring(0, 300) + "...";

            const msg = await getLocalizedString(ctx, "INFO", title, url, title_japanese, studio, synopsis, id);
            ctx.replyWithPhoto({ url: image_url }, { caption: msg, parse_mode: "MarkdownV2" })
        }
        catch (e) { console.log(e); await replyWithLocalizedString(ctx, "CANT_FIND_ANIME_BY_ID"); }
    });

    bot.command("add", async (ctx) => {
        const id = getCommandArgumentId(ctx.message.text);
        if (!id) { await replyWithLocalizedString(ctx, "ID_INVALID_OR_EMPTY"); return; }

        try {
            const { title } = await getAnimeById(id);
            await addAnimeToList(ctx.from.id, id);
            replyWithLocalizedString(ctx, "ADDED_TO_FAVOURITES", title);
        }
        catch (e) { console.log(e); await replyWithLocalizedString(ctx, "CANT_FIND_ANIME_BY_ID"); }
    });

    bot.command("remove", async (ctx) => {
        const id = getCommandArgumentId(ctx.message.text);
        if (!id) { await replyWithLocalizedString(ctx, "ID_INVALID_OR_EMPTY"); return; }

        try {
            const { title } = await getAnimeById(id);
            await removeAnimeFromList(ctx.from.id, id);
            replyWithLocalizedString(ctx, "REMOVED_FROM_FAVOURITES", title);
        }
        catch (e) { console.log(e); await replyWithLocalizedString(ctx, "CANT_FIND_ANIME_BY_ID"); }
    });

    bot.command("list", async (ctx) => {
        try {
            let list = await getUserList(ctx.from.id);

            let msg = "";
            for (let i = 0; i < list.length; i++) {
                const { title, url, mal_id } = await getAnimeById(list[i]);

                const precedingZeroes = '0'.repeat(6 - digitCount(mal_id));
                msg += `#${precedingZeroes}${mal_id}: [${escape(title)}]@(${escape(url)}@)\n`;
                await delay(1000);
            }

            await replyWithLocalizedString(ctx, "LIST", msg);
        }
        catch (e) { console.log(e); await replyWithLocalizedString(ctx, "LIST_ERROR"); }
    });

    bot.command("language", async (ctx) => {
        try {
            await switchLanguage(ctx.from.id);
            await replyWithLocalizedString(ctx, "LANGUAGE", await getUserLanguage(ctx.from.id));
        }
        catch (e) { console.log(e); await replyWithLocalizedString(ctx, "LANGUAGE_ERROR"); }
    });

    bot.launch();
}

main().catch((e) => console.log(e));