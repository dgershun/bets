const Telegraf = require('telegraf');
const session = require('telegraf/session');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-north-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const { AirtableClient } = require('./airtable-client/index');
const { LivescoreClient } = require('./livescore-client');
const { AirtableService } = require('./airtable-service');
const { LivescoreService } = require('./livescore-service');
const { PointsCalculator } = require('./points-calculator');
const { GameResult } = require('./game-result');
const { botToken } = require('./config');

const { Markup, Extra } = Telegraf;

const airtableClient = new AirtableClient();
const livescoreClient = new LivescoreClient();
const airtableService = new AirtableService(airtableClient);
const livescoreService = new LivescoreService(livescoreClient);

const bot = new Telegraf(botToken);
bot.use(session());

const publishedCommands = ['/bet', '/past', '/live', '/coming', '/leaders', '/help'];
// eslint-disable-next-line no-unused-vars
const implementedCommands = [...publishedCommands, '/updated'];
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
    const [humanId, chosenGame] = ctx.match[1].split('&');
    const userId = ctx.from.id;

    const params = {
        TableName: 'sessions',
        Item: {
            userid: userId.toString(),
            sessionValue: { humanId, chosenGame }
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
            ctx.reply(`Selected game: ${chosenGame}`);
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
            const {humanId, chosenGame} = data.Item.sessionValue;
            airtableService.makeBet(Number(humanId), name, chosenGame, score);
            ctx.reply(`Saved! ${chosenGame} ${score}. One more /bet ?`);
        }
    });
});

bot.command('past', async (ctx) => {
    console.log('Start "/past" handler...');
    const games = await livescoreService.getCLPastGames();
    const response = games
        .map(
            (game) =>
                `${game.getDate()}   <b>${game.getHomeName()}</b> - <b>${game.getAwayName()}</b>    ${game.getScore()}    (FT: ${game.getFullTimeScore()})`
        )
        .join('\n');
    ctx.replyWithHTML(response);
});

bot.command('coming', async (ctx) => {
    console.log('Start "/coming" handler...');
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
    console.log('Start "/live" handler...');
    const games = await livescoreService.getCLLiveGames();
    if (games.length === 0) {
        ctx.reply('No live games at the moment');
        return;
    }
    const response = games
        .map(
            (game) =>
                `${game.getScore()}    ${game.getTimeFromBeginning()}   <b>${game.getHomeName()}</b> - <b>${game.getAwayName()}</b>`
        )
        .join('\n');
    ctx.replyWithHTML(response);
});

bot.command('bet', async (ctx) => {
    console.log('Start "/bet" handler...');
    const comingGames = await livescoreService.getCLComingGames();
    const name = ctx.from.first_name || ctx.from.username;
    const heroBets = await airtableService.getHeroBets(name);
    const filteredGames = comingGames.filter(
        (game) => !heroBets.includes(Number(game.getId()))
    )

    if (filteredGames.length === 0) {
        ctx.reply(
            'You have already bet on all available games. Follow the results with the /live command!'
        );
        return;
    }

    const buttons = filteredGames.map((game) =>
        Markup.callbackButton(game.getTitle(), `choose-game#${game.getId()}&${game.getTitle()}`)
    );
    ctx.reply(
        'Choose the Game',
        Extra.markdown().markup((m) => m.inlineKeyboard(buttons, { columns: 1 }))
    );
});

bot.command('leaders', async (ctx) => {
    console.log('Start "/leaders" handler...');
    const leaders = await airtableService.getLeaders();
    const rows = Object.entries(leaders)
        .sort((a, b) => b[1] - a[1])
        .map(([hero, points]) => `${hero} - ${points}`)
        .join('\n');
    ctx.reply(`Leaders:\n\n${rows}`);
});

bot.command('update', async (ctx) => {
    console.log('Start "/update" handler...');
    const pastGamesPromise = livescoreService.getCLPastGames();
    const liveGamesPromise = livescoreService.getCLLiveGames();
    const notFilledRecordsPromise = airtableService.selectNotFilledRecords();

    const [pastGames, liveGames, notFilledRecords] = await Promise.all([
        pastGamesPromise,
        liveGamesPromise,
        notFilledRecordsPromise
    ]);

    const pastLiveGames = liveGames.filter((game) => game.isFinished());

    const allPastGames = [...pastGames, ...pastLiveGames];

    const forUpdate = [];
    notFilledRecords.forEach(({ recordId, humanId, gameTitle, bet, result, points }) => {
        const currentGame = allPastGames.find((game) => game.getTitle() === gameTitle);

        if (!currentGame) {
            return;
        }

        const forUpdateItem = { recordId, humanId };

        if (result === undefined) {
            forUpdateItem.result = currentGame.getScore();
        }

        if (points === undefined) {
            const betAsResult = new GameResult(bet);
            const pointsEarned = new PointsCalculator(currentGame, betAsResult).getEarnedPoints();
            forUpdateItem.points = pointsEarned;
        }

        if (points === undefined || result === undefined) {
            forUpdate.push(forUpdateItem);
        }
    });
    const forUpdateHumanable = forUpdate.map(({ humanId, result, points }) => ({
        id: humanId,
        result,
        points
    }));
    await airtableService.updateRecords(forUpdate);
    if (forUpdate.length > 0) {
        ctx.reply(`Updated:\n\n${forUpdateHumanable.map(JSON.stringify).join('\n')}`);
    } else {
        ctx.reply('The table is up-to-date!');
    }
});

bot.help(async (ctx) => {
    ctx.reply(`List of available commands:\n\n${publishedCommands.join('\n\n')}`);
});

bot.start(async (ctx) => {
    ctx.reply('Hi!\nType /help for the commands list.');
    ctx.reply(`List of available commands:\n\n${publishedCommands.join('\n\n')}`);
});

exports.lambdaHandler = async (event, context, callback) => {
    console.log(event.body);
    const eventBody = JSON.parse(event.body);
    const { username, id: userId } = eventBody.message.from;
    console.log(`From: ${username}`);

    const params = {
        TableName: 'sessions',
        Key: {
            userid: userId.toString(),
        },
        ProjectionExpression: 'userid',
    };

    const result = await new Promise((resolve) => {
        docClient.get(params, function (err, data) {
            if (err) {
                console.log('Error', err);
                resolve({statusCode: 500});
            } else {
                if (data.Item) {
                    console.log('Access granted');
                    bot.handleUpdate(eventBody);
                    resolve({statusCode: 200});
                } else {
                    console.log('Access denied');
                    resolve({statusCode: 403});
                }
            }
        });
    });

    return callback(null, result);
};
