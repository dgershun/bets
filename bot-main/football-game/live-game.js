const { BaseGame } = require('./base-game');
const { GameResult } = require('../game-result');

class LiveGame extends BaseGame {
    constructor(params) {
        super(params);
        this._result = new GameResult(params.score);
        this._timeFromBeginning = params.time;
    }

    getScore() {
        return this._result.toString();
    }

    getTimeFromBeginning() {
        return this._timeFromBeginning;
    }
}

module.exports = {
    LiveGame
};
