class AirtableService {
    constructor(client) {
        this._client = client;
    }

    async makeBet(name, game, score) {
        const params = {
            fields: {
                Game: game,
                Hero: name,
                Result: score
            }
        };
        return await this._client.createRecord('Bets', params);
    }

    async getLeaders() {
        const params = {
            fields: ['Hero', 'Points earned']
        };
        const records = await this._client.selectRecords('Bets', params);
        return records.reduce((acc, record) => {
            acc[record.get('Hero')] = (acc[record.get('Hero')] || 0) + Number(record.get('Points earned') || 0);
            return acc;
        }, {});
    }
}

module.exports = {
    AirtableService
};
