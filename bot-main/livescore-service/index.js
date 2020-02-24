const CL_COMPETITION_ID = '244';
const { PastGame, ComingGame } = require('../football-game/index');

class LivescoreService {
    constructor(client) {
        this._client = client;
    }

    async getCLComingGames() {
        return (await this._client
            .coming({ competitionId: CL_COMPETITION_ID }))
            .map((params) => new ComingGame(params));
    }

    async getCLPastGames() {
        return (await this._client
            .past({ competitionId: CL_COMPETITION_ID }))
            .map((params) => new PastGame(params));
    }
}

module.exports = {
    LivescoreService
};
