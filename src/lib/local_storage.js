
var bHasLocalStorage = false;

try {
    bHasLocalStorage = !!window.localStorage;
} catch (oError) {

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
                    fnSuccess(mItem);
                });
            }
        });
    }

};

export default local_storage;