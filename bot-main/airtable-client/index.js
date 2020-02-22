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
}

module.exports = {
    AirtableClient
}
