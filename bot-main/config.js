module.exports = {
    botToken: process.env.BOT_TOKEN,
    airtable: {
        token: process.env.AIRTABLE_TOKEN,
        base: process.env.AIRTABLE_BASE
    },
    livescore: {
        key: process.env.LIVESCORE_KEY,
        secret: process.env.LIVESCORE_SECRET,
        baseUrl: 'http://livescore-api.com/api-client'
    }
};
