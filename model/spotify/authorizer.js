const request = require('request');

const credentials = require('./credentials');

var getAuthLink = function (callback) {
    var url = 'https://accounts.spotify.com/authorize';
    url += '?client_id=' + credentials.clientId;
    url += '&response_type=code';
    url += '&redirect_uri=https%3A%2F%2www.wyvern.xyz%F';

    if (callback) {
        callback(url)
    } else {
        return url;
    }
};

var authorize = function (callback) {
    var options = {method: 'GET'};
    options.url = getAuthLink();

    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(response);
            callback(body);
        }
    })
};

module.exports.getAuthLink = getAuthLink;
module.exports.authorize = authorize;