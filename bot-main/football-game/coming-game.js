const format = require('date-fns/format');

const { BaseGame } = require('./base-game');

class ComingGame extends BaseGame {
    constructor(params) {
        super(params);
        this._score = params.score;
        this._datetime = new Date(`${params.date}Z${params.time}`);
    }

    getDatetime() {
        return format(this._date, 'dd MMM HH:mm');
    }
}

module.exports = {
    ComingGame
};
