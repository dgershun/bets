const axios = require('axios');
const { livescore } = require('../config');

const { key, secret, baseUrl } = livescore;

class LivescoreClient {
    // eslint-disable-next-line class-methods-use-this
    _request(path, params) {
        return axios.get(`${baseUrl}${path}`, {
            params: {
                key,
                secret,
                ...params
            }
        });
    }

    async coming({ competitionId }) {
        return (await this._request('/fixtures/matches.json', { competition_id: competitionId }))
            .data.data.fixtures;
    }

    async live({ competitionId }) {
        return (await this._request('/scores/live.json', { competition_id: competitionId })).data
            .data.match;
    }

    async past({ competitionId, from }) {
        return (await this._request('/scores/history.json', { competition_id: competitionId, from })).data
            .data.match;
    }
}

module.exports = {
    LivescoreClient
};
