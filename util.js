const { getUserLanguage } = require("./db");
const languageTemplate = require("./language-template.json");

function escape(str) {
    return str
        .replace(/_/gi, "\\_")
        .replace(/-/gi, "\\-")
        .replace(/~/g, "\\~")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/!/g, "\\!")
        .replace(/`/gi, "\\`")
        .replace(/#/gi, "\\#")
        .replace(/\./g, "\\.")
        .replace(/@\\/gi, "");
}

function digitCount(number) {
    return number.toString().length;
}

function getCommandArgument(str) {
    let arg = str.split(' ').slice(1).join(' ').trim();
    if (arg == "") return null;
    return arg;
}

function getCommandArgumentId(str) {
    let arg = str.split(' ').slice(1).join(' ').trim();
    if (arg == "") return null;
    if (arg.startsWith('#')) arg = arg.slice(1);
    return +arg;
}

function format() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getLocalizedString(ctx, template, ...arguments) {
    const language = await getUserLanguage(ctx.from.id);
    return escape(format(languageTemplate[language][template], ...arguments));
}

async function replyWithLocalizedString(ctx, template, ...arguments) {
    let str = await getLocalizedString(ctx, template, ...arguments);
    ctx.replyWithMarkdownV2(str);
}

module.exports = { escape, digitCount, getCommandArgument, getCommandArgumentId, getLocalizedString, replyWithLocalizedString, delay };