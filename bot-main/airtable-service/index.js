class AirtableService {
    constructor(client) {
        this.client = client;
    }

    async makeBet(name, game, score) {
        const params = {
            fields: {
                'Game': game,
                'Hero': name,
                'Result': score
            }
        };
        return await this.client.createRecord('Bets', params);
    }

    async fetchUpcomingGames() {
        const params = {
            fields: ['Title'],
            filterByFormula: "{Result} = ''"
        };
        const records = await this.client.selectRecords('Games', params);
        const titles = records.map((record) => record.get('Title'));
        return titles;
    }
}

module.exports = {
    AirtableService
};
