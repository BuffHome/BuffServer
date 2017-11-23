const express = require('express'),
    router = express.Router(),
    authorizer = require('../model/spotify/authorizer');

router.get("/", function (request, response) {
    authorizer.getAuthLink(function (link) {
        response.render("authorize.ejs", {authLink: link});
    })
});

module.exports = router;