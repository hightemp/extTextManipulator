var fs;
var oFs = {};

if (window.chrome) {
  fs = require('chrome-fs');
} else {
  fs = require('fs');
}

var aKeys = Object.keys(fs);

aKeys.forEach((sKey) => {
    oFs[sKey] = (...aArgs) => {
        return new Promise((fnSuccess, fnFail) => {
            if (fs[sKey+'Sync']) {
                console.log(`${sKey}Sync`, aArgs);
                fnSuccess(fs[sKey+'Sync'](...aArgs));
            } else {
                console.log(`${sKey}`, aArgs);
                fs[sKey](...aArgs, (...aCallbackArgs) => {
                    //console.log(`${sKey} - callback`, aCallbackArgs);
                    fnSuccess(...aCallbackArgs);
                });
            }
        });
    };
});

export default oFs;