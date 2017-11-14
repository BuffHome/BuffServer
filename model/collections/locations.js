var locations;

var init = function () {
    locations = [];
};

var addLocation = function (body, callback) {
    console.log(body);

    if (callback) callback();
};

module.exports.init = init;
module.exports.addLocation = addLocation;