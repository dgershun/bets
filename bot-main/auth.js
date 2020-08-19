const SUCCESS_RESULT = { statusCode: 200 };
const FORBID_RESULT = { statusCode: 403 };
const ERROR_RESULT = { statusCode: 500 };

const auth = async (isBotCallback, docClient, userId) => {
    if (isBotCallback) {
        return [true, SUCCESS_RESULT];
    }

    const params = {
        TableName: 'sessions',
        Key: {
            userid: userId.toString(),
        },
        ProjectionExpression: 'userid',
    };

    return new Promise((resolve) => {
        docClient.get(params, function (err, data) {
            if (err) {
                console.log('Error', err);
                resolve([false, ERROR_RESULT]);
            } else {
                if (data.Item) {
                    console.log('Access granted');
                    resolve([true, SUCCESS_RESULT]);
                } else {
                    console.log('Access denied');
                    resolve([false, FORBID_RESULT]);
                }
            }
        });
    });
};

module.exports = {
    auth,
};
