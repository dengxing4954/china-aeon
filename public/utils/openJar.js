const path = require('path');

function openJar(exec_path) {
    let exec = require('child_process').exec, child;
    return new Promise((reslove, reject) => {
        child = exec(`${path.join(__dirname, '../../exe/java')} -jar ${exec_path}`, (error, stdout, stderr) => {
            if (error !== null) {
                // console.log(error);
                reject(error);
            } else {
                // console.log(`call${stdout}`);
                reslove(stdout);
            }
        });
    });
}

module.exports = openJar;