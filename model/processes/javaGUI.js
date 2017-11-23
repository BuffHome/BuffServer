var exec = require('child_process').exec, child;
var openView = function (port, width, height) {
    child = exec('java -jar ./resources/java/SimpleWebView.jar '
        + port + ' ' + width + ' ' + height,
        function (error, stdout, stderr){
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if(error !== null){
                console.log('exec error: ' + error);
            }
        });
};

module.exports.openView = openView;