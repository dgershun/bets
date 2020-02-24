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

const implementedCommands = ['/bet', '/past', '/live', '/coming', '/help'];
const maxScore = 4;

const scores = (() => {
    const a = new Array(maxScore + 1).fill().map((_, i) => i);
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
            ctx.reply(`Selected game: ${chosenGame}`, keyboard);
            ctx.reply('Predict a score', keyboard);
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

bot.command('live', async (ctx) => {
    const games = await livescoreService.getCLLiveGames();
    if (games.length === 0) {
        ctx.reply('No live games at the moment');
        return;
    }
    const response = games
        .map(
            (game) =>
                `${game.getTimeFromBeginning()}   <b>${game.getHomeName()}</b> - <b>${game.getAwayName()}</b>`
        )
        .join('\n');
    ctx.replyWithHTML(response);
});

bot.command('bet', async (ctx) => {
    const comingGames = await livescoreService.getCLComingGames();
    const getGameTitle = (game) => `${game.getHomeName()} - ${game.getAwayName()}`;
    const buttons = comingGames.map((game) =>
        Markup.callbackButton(getGameTitle(game), `choose-game#${getGameTitle(game)}`)
    );
    ctx.reply(
        'Choose the Game',
        Extra.markdown().markup((m) => m.inlineKeyboard(buttons, { columns: 1 }))
    );
});

bot.help(async (ctx) => {
    ctx.reply(`List of available commands:\n\n${implementedCommands.join('\n\n')}`);
});

bot.start(async (ctx) => {
    ctx.reply('Hi!\nType /help for the commands list.');
    ctx.reply(`List of available commands:\n\n${implementedCommands.join('\n\n')}`);
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
