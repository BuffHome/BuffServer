const express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    locations = require('./model/collections/locations'),
    users = require('./model/collections/users'),
    timetable = require('./model/timetable'),
    spotify = require('./model/spotify');

var app = express();
const port = process.argv[2];

locations.init();
timetable.init();
users.init();
spotify.init();

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(__dirname + '/view'));

app.set('views',__dirname + '/view');
app.set('view engine', 'ejs');

app.use("/", require("./controller"));

http.createServer(app).listen(port);
console.log("[Server] Server started on port " + port);