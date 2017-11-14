const fs = require('fs');

var users;

var init = function () {
    users = [];
    fs.readFile("./resources/data/users.json", {}, function (error, data) {
        users = JSON.parse(data);
    });
};



module.exports.init = init;