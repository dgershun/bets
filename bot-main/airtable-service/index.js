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

    async fetchUpcomingGames() {
        const params = {
            fields: ['Title'],
            filterByFormula: "{Result} = ''"
        };
        const records = await this._client.selectRecords('Games', params);
        const titles = records.map((record) => record.get('Title'));
        return titles;
    }
}

module.exports = {
    AirtableService
};
