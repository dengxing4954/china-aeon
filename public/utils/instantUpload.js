const fs = require('fs');
const path = require('path');
const zipFile = require("./zipFile");
const dirPath = path.join(__dirname, "../../instantUpload");
const deleteFolderRecursive = require("./deleteFolder");
const request = require('request');

function instantUpload(path, { url, ...params }) {
    !Array.isArray(path) && (path = [path]);
    !fs.existsSync(dirPath) && fs.mkdirSync(dirPath);
    path.forEach(url => {
        if (fs.existsSync(url)) {
            if (fs.statSync(url).isDirectory()) {
                fs.readdirSync(url).forEach(file => {
                    fs.copyFileSync(`${url}/${file}`, `${dirPath}/${file}`);
                })
            } else {
                let arr = url.split("/");
                fs.copyFileSync(url, `${dirPath}/${arr[arr.length - 1]}`);
            }
        }
    });
    zipFile(dirPath).then(res => {
        console.log(res);
        deleteFolderRecursive(dirPath);
        // let formData = {
        //     command_id: 'UPLOADFILE',
        //     file: fs.createReadStream(res),
        //     ...params
        // };
        // request.post({ url, formData }, function (error, response, body) {
        //     console.log('err: ' + error);
        //     console.log(body);
        //     callback && callback(error || JSON.stringify(body));
        //     fs.unlinkSync(res);
        // });
    });
}

module.exports = instantUpload;