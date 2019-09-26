const path = require('path');
var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join(__dirname, `../OutApp/${require('../build/package.json').productName}-win32-ia32`),
    outputDirectory: path.join(__dirname, `../tmp/${require('../build/package.json').version}/installer`),
    authors: 'Vladimir Inc.',
    exe: `${require('../build/package.json').productName}.exe`,
    noMsi: true
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));