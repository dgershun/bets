const Airtable = require('airtable');
const {airtable} = require('../config');
const {token, base} = airtable;

class AirtableClient {
    constructor() {}

    get base() {
        return new Airtable({apiKey: token}).base(base);
    }

    async createRecord(
        table,
        params
    ){
        return this.base(table).create([params]);
    }

    async selectRecords(
        table,
        params
    ) {
        return this.base(table).select(params).all();
    }

    async updateRecord(
        table,
        id,
        params
    ) {
        return await this.base(table).update(id, params);
    }
}

module.exports = {
    AirtableClient
}
