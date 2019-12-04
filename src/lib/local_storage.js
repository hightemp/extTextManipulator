const fs = require('./fs.js').default;
const file_backup = require('./file_backup.js').default;
const moment = require('moment');

const sDataDirPath = './config';
const sDataFilePath = `${sDataDirPath}/config.json`;

var bHasLocalStorage = false;
var bIsChromeExtension = false;

var aAccepts = [{
    mimeTypes: ['text/*'],
    extensions: ['json']
}];

try {
    bHasLocalStorage = !!window.localStorage;
} catch (oError) {

}

try {
    bIsChromeExtension = !!window.chrome;
} catch (oError) {

}

function fnReadAsText(oFileEntry, fnCallback, fnErrorCallBack) 
{
    oFileEntry.file(
        function(oFile) {
            var oReader = new FileReader();

            oReader.onerror = (e) => { console.error(e); };
            oReader.onload = function(e) {
                fnCallback(e.target.result);
            };

            oReader.readAsText(oFile);
        },
        function(oError) {
            fnErrorCallBack(oError);
        }
    );
}

function fnWriteFileEntry(writableEntry, sData, fnCallback, fnErrorCallBack) 
{
    return new Promise((fnSuccess, fnFail) => {
        if (!writableEntry) {
            fnFail();
            return;
        }

        writableEntry.createWriter(
            function(writer) 
            {
                writer.onerror = fnErrorCallBack;
                writer.onwriteend = fnCallback;

                let opt_blob = Blob([sData], { type: "text/plain" });

                // If we have data, write it to the file. Otherwise, just use the file we
                // loaded.
                if (opt_blob) {
                    writer.truncate(opt_blob.size);
                    waitForIO(writer, function() {
                        writer.seek(0);
                        writer.write(opt_blob);
                        fnSuccess();
                    });
                }
            }, 
            fnErrorCallBack
        );
    });
}

function fnLoadFileEntry(oChosenEntry_in) 
{
    return new Promise((fnSuccess, fnFail) => {
        oChosenEntry = oChosenEntry_in;
        oChosenEntry.file(function(oFile) {
            fnReadAsText(
                oChosenEntry, 
                function(sResult) {
                    fnSuccess(sResult);
                },
                function(oError) {
                    fnFail(oError);
                }
            );
        });
    });
}

function fnShowFileDialog(sType='openFile')
{
    return new Promise((fnSuccess, fnFail) => {
        if (!bIsChromeExtension) {
            fnFail('Only in chrome extension');
            return;
        }
        chrome.fileSystem.chooseEntry(
            {
                type: sType, 
                accepts: aAccepts,
                suggestedName: 'config.json'
            }, 
            async function(oEntry) 
            {
                if (!oEntry) {
                    fnFail('Empty entry');
                    return;
                }

                if (sType=='openFile') {
                    fnSuccess(await fnLoadFileEntry(oEntry));
                }

                if (sType=='saveFile') {
                    fnSuccess(await fnWriteFileEntry(oEntry));
                }
            }
        );
    });
}

var local_storage = {

    async fnLoadData(oThis)
    {
        var sData;

        try {
            // var oBuffer = await fs.readFile(sDataFilePath);
            // var sData = oBuffer.toString();
            var sData = await fnShowFileDialog(); 

            console.log('sData', sData);

            if (sData) {
                var oData = JSON.parse(sData);
                // var aKeys = Object.keys(oData);

                console.log('oData', oData);

                Object.assign(oThis.$data, oData);

                console.log('oThis.$data', oThis.$data);
            }
        } catch (oError) {
            oThis.fnNotifyError(oError.toString());

            if (sData) {
                var sStorageItemName = 'config_'+moment().unix();
                var sMessage = `config saved to '${sStorageItemName}'`;

                oThis.fnNotifyError(sMessage);
                console.error(sMessage);

                this.setItem(sStorageItemName, sData);
            }
        }
    },

    async fnSaveData(oThis)
    {
        var sData = JSON.stringify(oThis.$data, null, 4);

        /*
        if (!await fs.exists(sDataDirPath)) {
            await fs.mkdir(sDataDirPath, 0o777);
        }

        if (await fs.exists(sDataFilePath)) {
            try {
                await file_backup(sDataFilePath, 50);
            } catch (oFileBackupError) {
                console.error(oFileBackupError);
            }
        }
        */

        // await fs.writeFile(sDataFilePath, sData, { mode: 0o777 });
        await fnShowFileDialog('saveFile'); 
    },

    async setItem(sKey, mValue) 
    {
        return new Promise((fnSuccess, fnFail) => {
            if (bHasLocalStorage) {
                fnSuccess(window.localStorage.setItem(sKey, mValue));
            } else {
                chrome.storage.sync.set({ [sKey]: mValue }, function() {
                    fnSuccess();
                });
            }
        });
    },

    async getItem(sKey)
    {
        return new Promise((fnSuccess, fnFail) => {
            if (bHasLocalStorage) {
                fnSuccess(window.localStorage.getItem(sKey));
            } else {
                chrome.storage.sync.get([ sKey ], function(mItem) {
                    fnSuccess(mItem[sKey]);
                });
            }
        });
    }

};

export default local_storage;