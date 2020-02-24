const Telegraf = require('telegraf');
const session = require('telegraf/session');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-north-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const { AirtableClient } = require('./airtable-client/index');
const { LivescoreClient } = require('./livescore-client');
const { AirtableService } = require('./airtable-service');
const { LivescoreService } = require('./livescore-service');
const { botToken } = require('./config');

const { Markup, Extra } = Telegraf;

const airtableClient = new AirtableClient();
const livescoreClient = new LivescoreClient();
const airtableService = new AirtableService(airtableClient);
const livescoreService = new LivescoreService(livescoreClient);

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
    const chosenGame = ctx.match[1];
    const userId = ctx.from.id;

    const params = {
        TableName: 'sessions',
        Item: {
            userid: userId.toString(),
            sessionValue: { chosenGame }
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Success', data);
            const buttons = scores.map(({ value }) =>
                Markup.callbackButton(`${value}`, `save-score#${value}`)
            );
            const keyboard = Extra.HTML().markup((m) => m.inlineKeyboard(buttons, { columns: 2 }));
            ctx.reply('Choose score', keyboard);
        }
    });
});

bot.action(/save-score#(.+)/, async (ctx) => {
    const score = ctx.match[1];
    const userId = ctx.from.id;
    const name = ctx.from.first_name || ctx.from.username;
    const params = {
        TableName: 'sessions',
        Key: {
            userid: userId.toString()
        },
        ProjectionExpression: 'sessionValue'
    };
    docClient.get(params, function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Success', data.Item);
            const chosenGame = data.Item.sessionValue.chosenGame;
            airtableService.makeBet(name, chosenGame, score);
            ctx.reply(`Saved! ${chosenGame} ${score}`);
        }
    });
});

bot.command('past', async (ctx) => {
    const games = await livescoreService.getCLPastGames();
    const response = games
        .map(
            (game) =>
                `${game.getDate()}   <b>${game.getHomeName()}</b> - <b>${game.getAwayName()}</b>    ${game.getScore()}`
        )
        .join('\n');
    ctx.replyWithHTML(response);
});

bot.command('coming', async (ctx) => {
    const games = await livescoreService.getCLComingGames();
    const response = games
        .map(
            (game) =>
                `${game.getDatetime()}   <b>${game.getHomeName()}</b> - <b>${game.getAwayName()}</b>`
        )
        .join('\n');
    ctx.replyWithHTML(response);
});

bot.start(async (ctx) => {
    const upcomingGames = await airtableService.fetchUpcomingGames();
    const buttons = upcomingGames.map((game) => Markup.callbackButton(game, `choose-game#${game}`));
    ctx.reply(
        'Choose game',
        Extra.markdown().markup((m) => m.inlineKeyboard(buttons))
    );
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
