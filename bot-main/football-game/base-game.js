class BaseGame {
    constructor({ id, home_name, away_name, competition_name, status }) {
        this._id = id;
        this._competition_name = competition_name;
        this._homeName = home_name;
        this._awayName = away_name;
        this._status = status;
    }

    getId() {
        return this._id;
    }

    getHomeName() {
        return this._homeName;
    }

    getAwayName() {
        return this._awayName;
    }

    getTitle() {
        return `${this.getHomeName()} - ${this.getAwayName()}`;
    }
}

module.exports = {
    BaseGame
};

/**
 * JSON:
 * {
        "id": "1328370",
        "date": "2020-02-25",
        "time": "20:00:00",
        "round": "R16",
        "home_name": "Chelsea",
        "away_name": "Bayern Munich",
        "location": "Stamford Bridge",
        "league_id": "404",
        "competition_id": "244",
        "home_id": "17",
        "away_id": "46",
        "competition": {
          "id": "244",
          "name": "Champions League"
        },
        "league": {
          "id": "404",
          "name": "Round of 16",
          "country_id": "84"
        }
      }
 */
