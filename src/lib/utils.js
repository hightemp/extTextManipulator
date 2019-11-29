
export default {
    fnGetFirstKey(oObject)
    {
        return Object.keys(oObject)[0];
    },
    fnGetFirstValue(oObject)
    {
        return oObject[fnGetFirstKey(oObject)];
    }
};