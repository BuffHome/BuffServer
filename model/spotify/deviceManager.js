const spotify = require('./index');

var getDevices = function (callback) {
    spotify.getApi(function (api) {
        api.getMyDevices(function (reponse) {
            callback(reponse);
        })
    })
};

var getPlayer = function (callback) {
    spotify.getApi(function (api) {
        api.getMyCurrentPlaybackState(function (response) {
            callback(response);
        })
    })
};

getDevices(function (reponse) {
    console.log(reponse);
});