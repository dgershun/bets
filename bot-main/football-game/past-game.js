const format = require('date-fns/format');

const { BaseGame } = require('./base-game');

class PastGame extends BaseGame {
    constructor(params) {
        super(params);
        this._score = params.score;
        this._date = new Date(`${params.date}`);
    }

    getScore() {
        return this._score;
    }

    getDate() {
        return format(this._date, 'dd MMM');
    }
}

module.exports = {
    PastGame
};
