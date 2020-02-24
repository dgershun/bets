const { BaseGame } = require('./base-game');

class LiveGame extends BaseGame {
    constructor(params) {
        super(params);
        this._score = params.score;
        this._timeFromBeginning = params.time;
    }

    getScore() {
        return this._score;
    }

    getTimeFromBeginning() {
        return this._timeFromBeginning;
    }
}

module.exports = {
    LiveGame
};
