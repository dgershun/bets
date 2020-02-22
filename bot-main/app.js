const Telegraf = require('telegraf');
const session = require('telegraf/session');
const { AirtableClient } = require('./airtable-client');
const { AirtableService } = require('./airtable-service');
const { botToken } = require('./config');

const { Markup, Extra } = Telegraf;

const airtableClient = new AirtableClient();
const airtableService = new AirtableService(airtableClient);
const bot = new Telegraf(botToken);
bot.use(session());

const scores = (() => {
    const a = new Array(4).fill().map((_, i) => i);
    const b = a.slice(0);
    const result = [];
    a.forEach((i) => {
        b.forEach((j) => {
            result.push({
                value: `${i}-${j}`
            });
        });
    });
    return result;
})();

bot.action(/choose-game#(.+)/, (ctx) => {
    ctx.session.chosenGame = ctx.match[1];
    const buttons = scores.map(({ value }) => Markup.callbackButton(`${value}`, `save-score#${value}`));
    const keyboard = Extra.HTML().markup((m) => m.inlineKeyboard(buttons, { columns: 2 }));
    ctx.reply('Choose score', keyboard);
});

bot.action(/save-score#(.+)/, async (ctx) => {
    const score = ctx.match[1];
    const {chosenGame} = ctx.session;
    const name = ctx.from.first_name || ctx.from.username
    airtableService.makeBet(name, chosenGame, score);
    ctx.reply(`Saved! ${chosenGame} ${score}`);
});

bot.start(async (ctx) => {
    const upcomingGames = await airtableService.fetchUpcomingGames();
    console.log(upcomingGames)
    const buttons = upcomingGames.map((game) => (Markup.callbackButton(game, `choose-game#${game}`)));
    ctx.reply('Choose game', Extra.markdown().markup((m) => m.inlineKeyboard(buttons)));
});

exports.lambdaHandler = async (event, context, callback) => {
    console.log(event);
    const tmp = JSON.parse(event.body);
    bot.handleUpdate(tmp);
    return callback(null, {
        statusCode: 200,
        body: ''
    });
};
