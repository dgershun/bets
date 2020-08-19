class PointsCalculator {
    constructor(game, bet) {
        this._game = game;
        this._bet = bet;
    }

    getEarnedPoints() {
        const betScore1 = this._bet.getScore1();
        const betScore2 = this._bet.getScore2();
        const gameScore1 = this._game.getFullTimeScore().getScore1();
        const gameScore2 = this._game.getFullTimeScore().getScore2();

        if (betScore1 === gameScore1 && betScore2 === gameScore2) {
            return 5;
        }

        if (betScore1 - betScore2 === gameScore1 - gameScore2) {
            return 3;
        }

        if (
            (betScore1 > betScore2 && gameScore1 > gameScore2) ||
            (betScore1 < betScore2 && gameScore1 < gameScore2)
        ) {
            return 2;
        }

        return 0;
    }
}

module.exports = {
    PointsCalculator,
};
