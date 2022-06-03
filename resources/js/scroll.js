window.onscroll = () => {
    positionNavigation({ trigger: 'scroll' });
    monitorScrolling();
};

function monitorScrolling() {
    if (window.scrollTimer != -1) {
        clearTimeout(window.scrollTimer);
    }

    window.scrollTimer = window.setTimeout("scrollStopped()", 500);
}

function scrollStopped() {
    window.scrollingToSection = false;
}


// From https://stackoverflow.com/a/4770179

function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    let disabledKeys = { 37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1 };

    if (disabledKeys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

let supportsPassive = false;

try {
    window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
    }));
} catch(e) {}

let wheelOpt = supportsPassive ? { passive: false } : false;
let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function disableScrolling() {
    window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.addEventListener(wheelEvent, preventDefault, wheelOpt);
    window.addEventListener('touchmove', preventDefault, wheelOpt);
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScrolling() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}