const { BaseGame } = require('./base-game');
const { GameResult } = require('../game-result');

class LiveGame extends BaseGame {
    constructor(params) {
        super(params);
        this._result = new GameResult(params.score);
        this._fullTimeScore = params.ft_score ? new GameResult(params.ft_score) : null;
        this._timeFromBeginning = params.time;
    }

    getScore() {
        return this._result.toString();
    }

    getFullTimeScore() {
        return this._fullTimeScore;
    }

    getTimeFromBeginning() {
        return this._timeFromBeginning;
    }

    isFinished() {
        return !!this._fullTimeScore;
    }
}

module.exports = {
    LiveGame,
};
