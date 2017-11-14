const express = require('express'),
    router = express.Router(),
    locations = require('../model/collections/locations');

router.post(function (request, response) {
    console.log(request.body);
});

module.exports = router;