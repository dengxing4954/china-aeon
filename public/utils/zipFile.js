const fs = require('fs');
const archiver = require('archiver');

function zip(path) {
    return new Promise((reslove, reject) => {
        let zip = path + ".zip";
        let output = fs.createWriteStream(zip);
        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            reslove(zip);
        });
        output.on('end', function () {
            console.log('Data has been drained');
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });
        archive.on('error', function (err) {
            console.log(err);
            reject(err);
        });
        let arr = path.split("/");
        archive.pipe(output);
        if (fs.statSync(path).isDirectory()) {
            archive.directory(path, false);
        } else {
            archive.file(path, { name: arr[arr.length - 1] });
        }
        archive.finalize();
    });
}

async function zipFile(path) {
    let isArray = Array.isArray(path);
    let ret;
    if (isArray) {
        let arr = path.map(async url => {
            try {
                return await zip(url);
            } catch (error) {
                return "";
            }
        })
        ret = [];
        for (const iterator of arr) {
            ret.push(await iterator);
        }
    } else {
        try {
            ret = await zip(path);
        } catch (error) {
            ret = "";
        }
    }
    return ret;
}

module.exports = zipFile;