const axios = require('axios');
const { livescore } = require('../config');

const { key, secret, baseUrl } = livescore;

class LivescoreClient {
    // eslint-disable-next-line class-methods-use-this
    async _request(path, params) {
        const queryParams = {
            params: {
                key,
                secret,
                ...params
            }
        };
        console.log(`Start request to ${baseUrl}${path} with params: ${JSON.stringify(queryParams)}`);
        const response = axios.get(`${baseUrl}${path}`, queryParams);
        console.log('Response: ', JSON.stringify(response));
        return response;
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
