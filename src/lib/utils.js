
export function fnGetFirstKey(oObject)
{
    return Object.keys(oObject)[0];
}

export function fnGetFirstValue(oObject)
{
    return oObject[fnGetFirstKey(oObject)];
}