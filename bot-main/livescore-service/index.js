const CL_COMPETITION_ID = '244';
const { PastGame, ComingGame, LiveGame } = require('../football-game');

class LivescoreService {
    constructor(client) {
        this._client = client;
    }

    async getCLComingGames() {
        return (
            await this._client.coming({
                competitionId: CL_COMPETITION_ID,
            })
        )
        // tmp for season 2020
        .filter(({time}) => time.split(':')[0] === '19')
        .map((params) => new ComingGame(params));
    }

    async getCLPastGames() {
        return (await this._client
            .past({ competitionId: CL_COMPETITION_ID, from: '2020-01-01' }))
        .map((params) => new PastGame(params));
    }

    async getCLLiveGames() {
        return (
            await this._client.live({
                competitionId: CL_COMPETITION_ID,
            })
        )
        // tmp for season 2020
        .filter(({time}) => time.split(':')[0] === '19')
        .map((params) => new LiveGame(params));
    }
}

module.exports = {
    LivescoreService,
};
