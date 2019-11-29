const chrome_fs = require('chrome-fs');

var oFs = {};
var aKeys = Object.keys(chrome_fs);

aKeys.forEach((sKey) => {
    oFs[sKey] = (...aArgs) => {
        return new Promise((fnSuccess, fnFail) => {
            chrome_fs[oFs](...aArgs, (...aCallbackArgs) => {
                fnSuccess(...aCallbackArgs);
            });            
        });
    };
});

module.exports = oFs;