const { format, utcToZonedTime } = require('date-fns-tz');

const { BaseGame } = require('./base-game');

class ComingGame extends BaseGame {
    constructor(params) {
        super(params);
        this._score = params.score;
        this._datetime = new Date(`${params.date}Z${params.time}`);
    }

    getDatetime() {
        const moscowTimeZone = 'Europe/Moscow';
        const dateTime = this._datetime;
        const moscowDatetime = utcToZonedTime(dateTime, moscowTimeZone);
        return format(moscowDatetime, 'dd MMM HH:mm');
    }
}

module.exports = {
    ComingGame
};
