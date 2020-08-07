class GameResult {
    constructor(resultString) {
        const [score1, score2] = resultString.split('-').map((s) => s.trim());
        this._score1 = score1;
        this._score2 = score2;
    }

    getScore1() {
        return this._score1;
    }

    getScore2() {
        return this._score2;
    }

    toString() {
        return `${this._score1}-${this._score2}`;
    }
}

module.exports = {
    GameResult
}
