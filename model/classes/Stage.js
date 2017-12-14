const Queue = require('./Queue');

function Stage(port, width, height) {
    var child = require('child_process').exec('java -jar ./resources/java/SimpleWebView.jar '
        + port + ' ' + width + ' ' + height);

    var outStream = new Queue();

    child.stdout.on('data', function (data) {
        outStream.enqueue(data);
    });

    child.on('close', function (data) {
        console.log(data);
    });

    this.outStream = outStream;
    this.process = child;
}

Stage.prototype.constructor = Stage;

Stage.prototype.write = function (data) {
    this.process.stdin.write(data);
};

Stage.prototype.readData = function () {
    return this.outStream.dequeue();
};

Stage.prototype.hasData = function () {
    return this.outStream.peek() !== undefined;
};

module.exports = Stage;