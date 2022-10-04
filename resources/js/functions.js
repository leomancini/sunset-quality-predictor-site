function getOffset(element) {
    const boundingBox = element.getBoundingClientRect();

    return {
        left: boundingBox.left + window.scrollX,
        top: boundingBox.top + window.scrollY
    };
}

function hasDST(date = new Date()) {
    // From https://bobbyhadz.com/blog/javascript-date-check-if-dst
    const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();

    return Math.max(january, july) !== date.getTimezoneOffset();
}

function getTimeInNewYork() {
    let today = new Date();
    let nowUTC = today.getTime() + (today.getTimezoneOffset() * 60000);
    let nowEST = new Date(nowUTC + (3600000*-5));

    let offsetESTorEDT = hasDST(nowEST) ? -4 : -5;
    let nowESTorEDT = new Date(nowUTC + (3600000*offsetESTorEDT));

    let actualTimezoneOffset = nowESTorEDT.getTimezoneOffset() * 60000;

    return {
        date: nowESTorEDT,
        ISOString: (new Date(nowESTorEDT - actualTimezoneOffset)).toISOString().slice(0, -1)
    };
}