
var bHasLocalStorage = false;

try {
    bHasLocalStorage = !!window.localStorage;
} catch (oError) {

}

function fnLoadData()
{
/*
    if (!await fs.exists(sDataDirPath)) {
      await fs.mkdir(sDataDirPath, 0o777);
    } else if (await fs.exists(sDataFilePath)) {

      var sData;

      try {
        var oThis = this;
        //var oBuffer = await fs.readFile(sDataFilePath);
        //var sData = oBuffer.toString();

        sData = await storage.getItem('config');

        console.log('sData', sData);

        if (sData) {
          var oData = JSON.parse(sData);
  //        var aKeys = Object.keys(oData);

          console.log('oData', oData);

          Object.assign(oThis.$data, oData);
  
          console.log('oThis.$data', oThis.$data);
        }
      } catch (oError) {
        this.fnNotifyError(oError.toString());

        if (sData) {
          var sstorageItemName = 'config_'+moment().unix();
          var sMessage = `config saved to '${sstorageItemName}'`;
          this.fnNotifyError(sMessage);
          console.log(sMessage);

          storage.setItem(sstorageItemName, sData);
        }
      }
  //    }
*/
}

function fnSaveData()
{
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
    await fs.writeFile(sDataFilePath, sData, { mode: 0o777 });
    */
}

var local_storage = {

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