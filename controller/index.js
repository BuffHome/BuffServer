const express = require('express'),
    router = express.Router(),
    authorizer = require('../model/spotify/authorizer');

/**
 * Prints the request made when a request is made and returns a webpage if it is the default request.
 */
router.use(function (request, response, next) {
    console.log("[Request] Request method : " + request.method + " " + request.url);
    console.log("[Request] Request body :", request.body);
    if (request.method === "GET" && request.url === "/") {
        response.render("index.ejs",{});
    }
    next();
});

router.use("/postLocation", require("./postLocation"));
router.use("/getDevices", require("./getDevices"));
router.use("/authorize", require("./getAuthorize"));

module.exports = router;