class AirtableService {
    constructor(client) {
        this._client = client;
    }

    async makeBet(name, game, score) {
        const params = {
            fields: {
                Game: game,
                Hero: name,
                Bet: score
            }
        };
        return await this._client.createRecord('Bets', params);
    }

    async getLeaders() {
        const params = {
            fields: ['Hero', 'Points']
        };
        const records = await this._client.selectRecords('Bets', params);
        return records.reduce((acc, record) => {
            acc[record.get('Hero')] = (acc[record.get('Hero')] || 0) + Number(record.get('Points') || 0);
            return acc;
        }, {});
    }

    async selectNotFilledRecords() {
        const params = {
            fields: ['id', 'Game', 'Bet', 'Result', 'Points'],
            filterByFormula: `IF(OR(Result = '', Points = ''), TRUE(), FALSE())`
        };

        const records = await this._client.selectRecords('Bets', params);
        return records.map((record) => ({
            recordId: record.id,
            humanId: record.get('id'),
            gameTitle: record.get('Game'),
            bet: record.get('Bet'),
            result: record.get('Result'),
            points: record.get('Points')
        }))
    }

    async updateRecords(records) {
        return await Promise.all(
                records.map(({recordId, result, points}) => {
                let params = {};
                if (result) {
                    params = {...params, 'Result': result}
                }
                if (points !== undefined) {
                    params = {...params, 'Points': points}
                }
                console.log('Updating record', JSON.stringify(params));
                return this._client.updateRecord('Bets', recordId, params)
            })
        );
    }
}

module.exports = {
    AirtableService
};
