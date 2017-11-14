const express = require('express'),
    router = express.Router();

/**
 * Prints the request made when a request is made and returns a webpage if it is the default request.
 */
router.use(function (request, response, next) {
    console.log("[Request] " + request.method + " " + request.url);
    console.log(request.body);
    response.sendStatus(200);
    next();
});

router.use("/postLocation", require("./postLocation"));

module.exports = router;