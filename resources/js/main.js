window.onload = initialize;

function initialize() {
    window.scrollTimer = -1;
    window.scrollingToSection = false;
    window.popoverIsOpen = false;

    window.navigationElements = {
        'navigation': document.querySelector('#navigation'),
        'navigationItems': document.querySelector('#navigation').querySelectorAll('.item'),
        'headerSection': document.querySelector(`section[data-section-id='latest']`),
        'allOtherSections': document.querySelector('#sections'),
        'dayWithoutVideoTooltip': document.querySelector('#dayWithoutVideoTooltip')
    };

    window.navigationBottomPadding = 24;
    window.navigationHeight = 44 + (window.navigationBottomPadding * 2);
    window.navigationOffset = 0;

    setTimeout(() => {
        if (window.location.hash) {
            if (window.location.hash.includes('#sunset-')) {
                let date = window.location.hash.replace('#sunset-', '');
                goToSection('history');
                openPopover(date, null);
                window.previousLocationHash = 'history';
            } else {
                let sectionId = window.location.hash.replace('#', '');
                window.previousLocationHash = sectionId;
                goToSection(sectionId);

                if (window.location.hash === '#latest' || !window.location.hash) {
                    document.querySelector('#navigation').classList.add('preVisible');
                }
            }
        }

        setTimeout(() => {
            document.querySelector('#curtain').classList.remove('visible');
            window.navigationElements.headerSection.querySelector('#content').classList.add('visible');

            if (window.navigationElements.navigation.classList.contains('preVisible')) {
                setTimeout(() => {
                    window.navigationElements.navigation.classList.add('visible');

                    setTimeout(() => {
                        window.navigationElements.navigation.classList.remove('preVisible');
                    }, 2000);
                }, 500);
            }
        }, 300);
    }, 100);

    window.navigationElements.navigationItems.forEach((navigationItem) => {
        navigationItem.onclick = () => {
            let sectionId = navigationItem.dataset.sectionId;
            window.scrollingToSection = true;

            goToSection(sectionId, 'smooth');
        };
    });

    document.querySelector('#popover .navigation.left .arrow').onclick = (e) => {
        let currentDate = window.location.hash.replace('#sunset-', '');
        switchPopover(currentDate, 'previous');
    }

    document.querySelector('#popover .navigation.right .arrow').onclick = (e) => {
        let currentDate = window.location.hash.replace('#sunset-', '');
        switchPopover(currentDate, 'next');
    }

    positionNavigation({ initialLoad: true });

    initializeCalendarInteractions();
}

function resetPopover() {
    let popover = document.querySelector('#popover');
    let popoverVideoContainer = popover.querySelector('.videoContainer');
    let popoverVideo = popoverVideoContainer.querySelector('.videoContainer video');

    popoverVideo.classList.remove('visible');

    popoverVideoContainer.querySelector('.loading').classList.add('visible');
    popoverVideoContainer.querySelector('.error').classList.remove('visible');

    setTimeout(() => {
        popoverVideo.pause();
        popoverVideo.removeAttribute('src');
        popoverVideo.load();
        popoverVideo.innerHTML = '';
    }, 100);
}

function closePopover() {
    let popover = document.querySelector('#popover');
    let popoverBackground = document.querySelector('#popoverBackground');
    let popoverVideo = popover.querySelector('.videoContainer video');

    popoverBackground.classList.remove('visible');
    popover.classList.remove('visible');

    popover.querySelector('.videoContainer .error').classList.remove('visible');

    setTimeout(() => {
        resetPopover();
    }, 300);

    window.location.hash = window.previousLocationHash;
    window.popoverIsOpen = false;

    enableScrolling();
}

function centerVideoNavigation() {
    document.querySelector('#popover .navigation.left').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;
    document.querySelector('#popover .navigation.right').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;
}

function openPopover(date, onError) {
    disableScrolling();

    let popover = document.querySelector('#popover');
    let popoverVideo = popover.querySelector('.videoContainer video');

    let day = document.querySelector(`.day[data-date='${date}']`);

    if (!window.popoverIsOpen) {
        popoverVideo.style.height = null;
        popoverVideo.style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;

        centerVideoNavigation();
    }

    if (!day.dataset.error) {
        window.popoverIsOpen = true;
        window.previousLocationHash = 'history';
        window.location.hash = `sunset-${date}`;

        popoverBackground.classList.add('visible');
        popover.classList.add('visible');

        popover.querySelector('.date').innerText = day.dataset.dateFormatted;
        popover.querySelector('.confidence .value').innerText = day.dataset.confidence;
        popover.querySelector('.stars').style.backgroundImage = `url('resources/images/stars-color/${day.dataset.rating}.png')`;

        let videoContainer = popover.querySelector('.videoContainer');
        let videoContainerLoading = videoContainer.querySelector('.loading');
        let videoContainerError = videoContainer.querySelector('.error');
        let video = videoContainer.querySelector('video');
        let source = document.createElement('source');

        // Show video if it is already loaded from a previous mouseover
        if (video.readyState === 4) {
            videoContainerLoading.classList.add('hidden');

            window.popoverVideoSize = {
                width: popoverVideo.offsetWidth,
                height: popoverVideo.offsetHeight
            };

            popoverVideo.style.height = `${window.popoverVideoSize.height}px`;
            centerVideoNavigation();

            setTimeout(() => {
                video.classList.add('visible');
                video.play();
            }, 300);
        }   

        // Show video when it is loaded on first mouseover
        video.addEventListener('loadeddata', function(event) {
            videoContainerLoading.classList.add('hidden');

            window.popoverVideoSize = {
                width: popoverVideo.offsetWidth,
                height: popoverVideo.offsetHeight
            };

            popoverVideo.style.height = `${window.popoverVideoSize.height}px`;
            centerVideoNavigation();
            
            setTimeout(() => {
                video.classList.add('visible');
                video.play();
            }, 300);
        });

        source.addEventListener('error', function(event) {
            if (onError && onError.direction) {
                switchPopover(date, onError.direction);
            }
        });

        source.setAttribute('src', `https://nycsunsetbot.leo.gd/publish/history/sunsets/${date}.mp4`);
        source.setAttribute('type', 'video/mp4');

        video.appendChild(source);
        video.currentTime = 0;

        let previousArrow = document.querySelector('#popover .navigation.left .arrow');
        let shouldShowPreviousArrow = false;
        let previousDate = getToDate(date, 'previous');
        let previousDateCalendarDayElement = document.querySelector(`.day[data-date='${previousDate}']`);
        shouldShowPreviousArrow = previousDateCalendarDayElement && previousDateCalendarDayElement.classList.contains('filled') && !previousDateCalendarDayElement.classList.contains('sunsetHasNotHappenedYet');

        if (shouldShowPreviousArrow) {
            previousArrow.classList.add('visible');
        } else {
            previousArrow.classList.remove('visible');
        }

        let nextArrow = document.querySelector('#popover .navigation.right .arrow');
        let shouldShowNextArrow = false;
        let nextDate = getToDate(date, 'next');
        let nextDateCalendarDayElement = document.querySelector(`.day[data-date='${nextDate}']`);
        shouldShowNextArrow = nextDateCalendarDayElement && nextDateCalendarDayElement.classList.contains('filled') && !nextDateCalendarDayElement.classList.contains('sunsetHasNotHappenedYet');

        if (shouldShowNextArrow) {
            nextArrow.classList.add('visible');
        } else {
            nextArrow.classList.remove('visible');
        }
    } else {
        if (onError && onError.direction) {
            switchPopover(date, onError.direction);
        }
    }
}

function initializeCalendarInteractions() {
    let calendar = document.querySelector('#calendar');
    let days = calendar.querySelectorAll('.day');

    let popoverBackground = document.querySelector('#popoverBackground');
    popoverBackground.onclick = closePopover;

    let months = calendar.querySelectorAll('.month');

    months.forEach((month) => {
        let monthNavigationButtonBack = month.querySelector(`.monthNavigation[data-direction='back']`);
        let monthNavigationButtonForward = month.querySelector(`.monthNavigation[data-direction='forward']`);

        monthNavigationButtonBack.onclick = () => {
            let currentVisibleMonthIndex = parseInt(calendar.querySelector('.month.visible').id.replace('month-', ''));

            if (currentVisibleMonthIndex !== 0) {
                monthNavigationButtonBack.classList.add('visible');
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex}`).classList.remove('visible');
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex - 1}`).classList.add('visible');
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex - 1} .monthNavigation[data-direction='forward']`).classList.add('visible');
            }

            if (currentVisibleMonthIndex === 1) {
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex - 1} .monthNavigation[data-direction='back']`).classList.remove('visible');
            }
        };

        monthNavigationButtonForward.onclick = () => {
            let currentVisibleMonthIndex = parseInt(calendar.querySelector('.month.visible').id.replace('month-', ''));

            if (currentVisibleMonthIndex + 1 < months.length) {
                monthNavigationButtonForward.classList.add('visible');
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex}`).classList.remove('visible');
                calendar.querySelector(`.month#month-${currentVisibleMonthIndex + 1}`).classList.add('visible');
            }
        };
    });

    days.forEach((day) => {
        if (day.classList.contains('filled')) {
            let date = day.dataset.date;
            let today = new Date();
            let now = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, -1);

            let sunsetHasHappened = true;

            if (now.split('T')[0] === date && today.getHours() < 22) {
                sunsetHasHappened = false;
                day.classList.add('sunsetHasNotHappenedYet');
            }

            let mouseIsOver = false;

            day.onmouseover = () => {
                mouseIsOver = true;

                if (sunsetHasHappened) {
                    let expandButton = day.querySelector('.expand');
                    let videoContainer = day.querySelector('.videoContainer');
                    let videoContainerLoading = videoContainer.querySelector('.loading');
                    let videoContainerError = videoContainer.querySelector('.error');
                    let video = videoContainer.querySelector('video');
                    let source = document.createElement('source');

                    if (!day.dataset.error) {
                         // Show video if it is already loaded from a previous mouseover
                        if (video.readyState === 4 && mouseIsOver) {
                            video.classList.add('visible');
                            expandButton.classList.add('visible');
                            videoContainerLoading.classList.add('hidden');
                        } else {
                            // Show video when it is loaded on first mouseover
                            video.addEventListener('loadeddata', function(event) {
                                if (mouseIsOver) {  
                                    video.classList.add('visible');
                                    expandButton.classList.add('visible');
                                    videoContainerLoading.classList.add('hidden');
                                }
                            });
                        }

                        source.setAttribute('src', `https://nycsunsetbot.leo.gd/publish/history/sunsets/${date}.mp4`);
                        source.setAttribute('type', 'video/mp4');

                        source.addEventListener('error', function(event) {
                            videoContainerLoading.classList.add('hidden');
                            videoContainerError.classList.add('visible');

                            day.dataset.error = true;
                        });

                        video.appendChild(source);
                        video.currentTime = 0;
                        video.play();
                    } else {
                        console.log('repeat error');
                        videoContainerLoading.classList.add('hidden');
                        videoContainerError.classList.add('visible');
                    }
                } else {
                    window.hoveringOverDayWithoutVideo = true;
                    window.navigationElements.dayWithoutVideoTooltip.classList.add('visible');
                }
            }

            day.onmouseout = () => {
                mouseIsOver = false;

                if (sunsetHasHappened) {
                    day.querySelector('.videoContainer video').classList.remove('visible');
                    day.querySelector('.videoContainer video').innerHTML = '';
                    day.querySelector('.expand').classList.remove('visible');
                    day.querySelector('.videoContainer .error').classList.remove('visible');
                } else {
                    window.navigationElements.dayWithoutVideoTooltip.classList.remove('visible');

                    window.hoveringOverDayWithoutVideo = false;
                }
            }

            day.onclick = () => {
                if (sunsetHasHappened) {
                    openPopover(date, null);
                }
            }
        }
    });
}

function getToDate(currentDate, direction) {
    let fromDate = new Date(currentDate);
    let toDate;

    if (direction === 'previous') {
        let previousDateRaw = new Date(fromDate);
        previousDateRaw.setDate(fromDate.getDate() - 1);
        let previousDate = previousDateRaw.toISOString().split('T')[0];

        toDate = previousDate;
    } else if (direction === 'next') {
        let nextDateRaw = new Date(fromDate);
        nextDateRaw.setDate(fromDate.getDate() + 1);
        let nextDate = nextDateRaw.toISOString().split('T')[0];

        toDate = nextDate;
    }

    return toDate;
}

function switchPopover(currentDate, direction) {
    let fromDate = new Date(currentDate);
    let toDate = getToDate(currentDate, direction);

    let toDateCalendarDayElement = document.querySelector(`.day[data-date='${toDate}']`);
    let shouldShowPopover = toDateCalendarDayElement && toDateCalendarDayElement.classList.contains('filled') && !toDateCalendarDayElement.classList.contains('sunsetHasNotHappenedYet');

    if (shouldShowPopover) {
        resetPopover();
        
        setTimeout(() => {
            openPopover(toDate, {
                direction
            });
        }, 100);
    } else {
        closePopover();
    }
}

document.onkeydown = function(event) {
    event = event || window.event;

    let isEscape, isArrowLeft, isArrowRight = false;

    if ('key' in event) {
        isEscape = (event.key === 'Escape' || event.key === 'Esc');
        isArrowLeft = (event.key === 'ArrowLeft');
        isArrowRight = (event.key === 'ArrowRight');
    } else {
        isEscape = (event.keyCode === 27);
        isArrowLeft = (event.keyCode === 37);
        isArrowRight = (event.keyCode === 39);
    }

    if (isEscape) {
        if (window.popoverIsOpen) { closePopover(); }
    }

    if (window.popoverIsOpen) {
        let currentDate = window.location.hash.replace('#sunset-', '');

        if (isArrowLeft) {
            switchPopover(currentDate, 'previous');
        }

        if (isArrowRight) {
            switchPopover(currentDate, 'next');
        }
    }
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

window.onmousemove = function (e) {
    let offset = 24;

    if (window.hoveringOverDayWithoutVideo) {
        window.navigationElements.dayWithoutVideoTooltip.style.top = (e.clientY + offset) + 'px';
        window.navigationElements.dayWithoutVideoTooltip.style.left = (e.clientX + offset) + 'px';  
    }
};

window.onscroll = () => {
    positionNavigation({ initialLoad: false });
    monitorScrolling();
};

window.onresize = () => {
    positionNavigation({ initialLoad: false });

    if (window.popoverIsOpen) {
        document.querySelector('#popover .videoContainer video').style.height = null;
        document.querySelector('#popover .videoContainer video').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;

        centerVideoNavigation();
    }
};

function getOffset(element) {
    const boundingBox = element.getBoundingClientRect();

    return {
        left: boundingBox.left + window.scrollX,
        top: boundingBox.top + window.scrollY
    };
}

function switchToSection(sectionId, behavior) {
    window.navigationElements.navigationItems.forEach((navigationItem) => { navigationItem.classList.remove('selected'); });
    window.navigationElements.navigation.querySelector(`.item[data-section-id='${sectionId}']`).classList.add('selected');

    window.location.hash = sectionId;
}

function goToSection(sectionId, behavior) {
    if (sectionId === 'latest') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior
        });
    } else {
        window.scrollTo({
          top: getOffset(document.querySelector(`section[data-section-id='${sectionId}']`)).top - window.navigationHeight - window.navigationOffset,
          left: 0,
          behavior
        });
    }

    switchToSection(sectionId, behavior);
}

function positionNavigation(params) {
    document.querySelector(`section[data-section-id='latest']`).style.height = `${window.innerHeight}px`;

    if (window.scrollY > (window.innerHeight - window.navigationHeight)) {
        document.querySelector(`section[data-section-id='latest']`).style.top = `${(window.innerHeight * -1) + window.navigationHeight}px`;
        document.querySelector(`section[data-section-id='latest']`).classList.add('scrolled');
        document.querySelector('#sections').style.marginTop = `${window.innerHeight + window.navigationOffset}px`;
        document.querySelector('#navigation').classList.add('scrolled');
    } else {
        document.querySelector(`section[data-section-id='latest']`).classList.remove('scrolled');
        document.querySelector('#navigation').classList.remove('scrolled');
        document.querySelector('#sections').style.marginTop = `0px`;
    }

    if (!params.initialLoad) {
        if (!window.scrollingToSection) {
            if (window.scrollY < (document.querySelector(`section[data-section-id='latest']`)).offsetHeight -  window.navigationHeight) {
                switchToSection('latest', null);
            } else if ((window.scrollY + (window.innerHeight / 1.5) - window.navigationHeight) > (getOffset(document.querySelector(`section[data-section-id='about']`)).top - window.navigationHeight) + parseInt(document.querySelector(`section[data-section-id='about']`).offsetHeight)) {
                switchToSection('follow', null);
            } else {
                let sections = document.querySelectorAll(`section`);

                sections.forEach((section) => {
                    let sectionId = section.dataset.sectionId;
                    
                    if (sectionId !== 'latest' && ((window.scrollY + window.navigationHeight) > getOffset(section).top) && (window.scrollY <= (getOffset(section).top - window.navigationHeight) + parseInt(section.offsetHeight))) {
                        switchToSection(sectionId, null);
                    }
                });
            }
        }
    }
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
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
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