class AirtableService {
    constructor(client) {
        this._client = client;
    }

    async makeBet(name, game, score) {
        const params = {
            fields: {
                'Game': game,
                'Hero': name,
                'Result': score
            }
        };
        return await this._client.createRecord('Bets', params);
    }
}

module.exports = {
    AirtableService
};
