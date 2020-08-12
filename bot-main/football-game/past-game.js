const { format } = require('date-fns');

const { BaseGame } = require('./base-game');
const { GameResult } = require('../game-result');

class PastGame extends BaseGame {
    constructor(params) {
        super(params);
        this._result = new GameResult(params.score);
        this._fullTimeScore = new GameResult(params.ft_score);
        this._date = new Date(`${params.date}`);
    }

    getResult() {
        return this._result;
    }

    getScore() {
        return this._result.toString();
    }

    getFullTimeScore() {
        return this._fullTimeScore;
    }

    getDate() {
        return format(this._date, 'dd MMM');
    }
}

module.exports = {
    PastGame
};
