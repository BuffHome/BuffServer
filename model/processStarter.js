const childProcess = require('child_process');

var startPyScript = function () {
    var py = childProcess.spawn('python', ['./resources/tostiScript.py']);

    py.stdout.on('data', function(data){
        console.log(data.toString());
    });

    /*Once the stream is done (on 'end') we want to simply log the received data to the console.*/
    py.stdout.on('end', function(){
        console.log("All done");
    });
};
startPyScript();

module.exports.startPyScript = startPyScript;