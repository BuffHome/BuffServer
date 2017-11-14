const express = require('express'),
    router = express.Router(),
    spotify = require('../model/spotify');

router.get(function (request, response) {
    spotify.getDevices(function (devices) {

    })
});

module.exports = router;