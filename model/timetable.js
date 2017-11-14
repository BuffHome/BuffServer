const url = require('url'),
    fs = require('fs'),
    Q = require('q');

var locations;

var init = function () {
    locations = "";
};

var getCalendar = function (user, callback) {
    const uri = "https://mytimetable.tudelft.nl/" + user.timeTableApi;
    const filePath = "./resources/data/calendar" + user.id + ".txt";

    fs.readFile("./resources/data/locations.txt", {}, function (error, data) {
        locations += data;
        locations = locations.split("\n");

        var newLocations = {};
        for (var i = 0; i < locations.length; i++) {
            var tag = locations[i].split(":")[0];
            var ll = locations[i].split(":")[1].split("&");
            newLocations[tag] = {
                lat: ll[0],
                long: ll[1]
            }
        }
        locations = newLocations;
    });
    var cellArray = [];
    download(uri, filePath).done(function () {
        var calendarString = "";
        var fileStream = fs.createReadStream(filePath);
        fileStream.on('data', function (chunk) {
            calendarString += chunk;
        });
        fileStream.on('close', function () {
            parseCalendar(calendarString, cellArray, function () {
                if (callback) callback(cellArray);
            });
        });
    });
};

var download = function (uri, filename) {
    var protocol = url.parse(uri).protocol.slice(0, -1);
    var deferred = Q.defer();
    var onError = function (e) {
        fs.unlink(filename);
        deferred.reject(e);
    };

    require(protocol).get(uri, function (response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            var fileStream = fs.createWriteStream(filename);
            fileStream.on('error', onError);
            fileStream.on('close', deferred.resolve);
            response.pipe(fileStream);
        } else if (response.headers.location) {
            deferred.resolve(download(response.headers.location, filename));
        } else {
            deferred.reject(new Error(response.statusCode + ' ' + response.statusMessage));
        }
    }).on('error', onError);
    return deferred.promise;
};

var parseDateString = function (string, callback) {
    if (string === undefined && callback !== undefined) {
        callback(string);
    } else {
        var date = string.split(":")[1].substr(0, string.length);
        var time = date.split("T")[1];
        date = date.split("T")[0];
        var year = date.substr(0, 4);
        var month = parseInt(date.substr(4, 2)) - 1;
        month = month >= 10 ? "" + month : (month >= 0 ? "0" + month : "11");
        var day = date.substr(6, 2);
        var hours = time.substr(0, 2);
        var minutes = time.substr(2, 2);
        callback(new Date(year, month, day, hours, minutes));
    }
};

var parseDescriptionString = function (string, callback) {
    var tagStack = [];
    var indexStack = [];
    var offsetStack = [];
    var description = {};
    var setIndex = string.indexOf("Student set(s):", 0);
    var typeIndex = string.indexOf("Type:", setIndex);
    var csIndex = string.indexOf("CSType:", typeIndex);
    var staffIndex = string.indexOf("Staff:", csIndex);
    var syncIndex = string.indexOf("synchronised on ", staffIndex);
    if (setIndex !== -1) {
        tagStack.push("sets");
        indexStack.push(setIndex);
        offsetStack.push("Student set(s):".length);
    }
    if (typeIndex !== -1) {
        tagStack.push("type");
        indexStack.push(typeIndex);
        offsetStack.push("Type:".length);
    }
    if (csIndex !== -1) {
        tagStack.push("csType");
        indexStack.push(csIndex);
        offsetStack.push("CSType:".length);
    }
    if (staffIndex !== -1) {
        tagStack.push("staff");
        indexStack.push(staffIndex);
        offsetStack.push("Staff".length);
    }
    if (syncIndex !== -1) {
        tagStack.push("syncedOn");
        indexStack.push(syncIndex);
        offsetStack.push("synchronised on ".length);
    }
    for (var i = 0; i < tagStack.length; i++) {
        var next = i + 1 < tagStack.length ? indexStack[i + 1] : string.length;
        var fieldString = string.substr(indexStack[i] + offsetStack[i], next - indexStack[i] - offsetStack[i]);
        while (fieldString[0] === " " || fieldString[0] === ":") fieldString = fieldString.substr(1, fieldString.length - 1);
        description[tagStack[i]] = fieldString;
    }
    if (description['sets'] !== undefined) {
        description['sets'] = description['sets'].split(", ");
    }
    if (callback !== undefined) callback(description);
};

var parseLocationString = function (string, callback) {
    if (string !== undefined) {
        var tag = string.split(/[- ]/)[0];
        if (locations[tag] === undefined) {
            callback(string);
        } else {
            var locationObject = {
                description: string,
                group: tag,
                lat: locations[tag].lat,
                long: locations[tag].long
            };
            callback(locationObject);
        }
    } else {
        callback(string);
    }
};

var parseCellString = function (string, cellArray, callback) {
    var stringArray = string.split(/\r\n(?=\S)/);
    var jsonObject = {};
    for (var i = 0; i < stringArray.length; i++) {
        stringArray[i] = stringArray[i].split(/\n ?/).join("");
        stringArray[i] = stringArray[i].split(/\r/).join("");
        stringArray[i] = stringArray[i].split(/\\n/).join("");
        stringArray[i] = stringArray[i].split(/\\/).join("");
        var splitIndex = stringArray[i].indexOf(";") !== -1 ? Math.min(stringArray[i].indexOf(":"), stringArray[i].indexOf(";")) : stringArray[i].indexOf(":");
        jsonObject[stringArray[i].substr(0, splitIndex).replace("-", "").toLowerCase()] = stringArray[i].substr(splitIndex + 1);
    }
    parseDateString(jsonObject['dtstart'], function (start) {
        parseDateString(jsonObject['dtend'], function (end) {
            parseDescriptionString(jsonObject['description'], function (description) {
                parseLocationString(jsonObject['location'], function (location) {
                    var cellObject = {
                        description: description,
                        start: start,
                        end: end,
                        summary: jsonObject['summary'],
                        location: location
                    };
                    var nullCell = false;
                    for (var j = 0; j < cellObject.length; j++) {
                        if (cellObject[j] === undefined) {
                            nullCell = true;
                        }
                    }
                    if (!nullCell) {
                        cellArray.push(cellObject);
                    }
                    if (callback) callback();
                });
            });
        });
    });
};

var parseCalendar = function (string, cellArray, callback) {
    var cellStrings = [];
    var endIndex = 0;
    var index = -2;
    while (endIndex !== -1) {
        index = string.indexOf("DESCRIPTION", index + 1);
        endIndex = string.indexOf("\r\n \r\n", index);
        if (endIndex !== -1) {
            cellStrings.push(string.substr(index, endIndex - index));
        } else {
            cellStrings.push(string.substr(index, string.length - index));
        }
    }
    var i = 0;
    cellStrings.forEach(function (cellString) {
        parseCellString(cellString, cellArray, function () {
            if (i + 1 === cellStrings.length) {
                if (callback) callback();
            } else {
                i++;
            }
        })
    });
};

module.exports.init = init;