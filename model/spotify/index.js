const SpotifyApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyApi({
    clientId: '1f8b09a172424dc6ace84c6f62e4891d',
    clientSecret: '7ffd94ad2dd646e3be08b0cde8a47dda'
});


var createCredentials = function (callback) {
    spotifyApi.clientCredentialsGrant()
        .then(function(data) {
            console.log('[Spotify] The access token expires in ' + data.body['expires_in']);
            console.log('[Spotify] The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);

            if (callback) callback();
        }, function(err) {
            console.log('[Spotify] Something went wrong when retrieving an access token', err.message);
        });
};

var init = function (callback) {
    createCredentials(callback);
};

var getApi = function (callback) {
    createCredentials(function () {
        if (callback) callback(spotifyApi);
        return spotifyApi;
    });
};

module.exports.deviceManager = require('./deviceManager');
module.exports.init = init;
module.exports.getApi = getApi;