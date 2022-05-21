window.onload = initialize;

function initialize() {
    window.scrollingToSection = false;

    window.navigationElements = {
        'navigation': document.querySelector('#navigation'),
        'navigationItems': document.querySelector('#navigation').querySelectorAll('.item'),
        'headerSection': document.querySelector(`section[data-section-id='latest']`),
        'allOtherSections': document.querySelector('#sections')
    };

    window.navigationBottomPadding = 24;
    window.navigationHeight = 44 + (window.navigationBottomPadding * 2);
    window.navigationOffset = 0;

    setTimeout(function() {
        if (window.location.hash === '#latest' || !window.location.hash) {
            document.querySelector('#navigation').classList.add('preVisible');
        }

        if (window.location.hash) {
            if (window.location.hash.includes('#sunset-')) {
                let date = window.location.hash.replace('#sunset-', '');
                openPopover(date);
                window.previousLocationHash = 'history';
            } else {
                let sectionId = window.location.hash.replace('#', '');
                goToSection(sectionId);
            }
        }

        setTimeout(function() {
            document.querySelector('#curtain').classList.remove('visible');
            window.navigationElements.headerSection.querySelector('#content').classList.add('visible');

            if (window.navigationElements.navigation.classList.contains('preVisible')) {
                setTimeout(function() {
                    window.navigationElements.navigation.classList.add('visible');

                    setTimeout(function() {
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

            setTimeout(() => {
                window.scrollingToSection = false;
            }, 1000);
        };
    });

    positionNavigation();
    initializeCalendarInteractions();
}

function closePopover() {
    let popover = document.querySelector('#popover');
    let popoverBackground = document.querySelector('#popoverBackground');
    let popoverVideo = popover.querySelector('.videoContainer video');

    popoverBackground.classList.remove('visible');
    popover.classList.remove('visible');

    popover.querySelector('.videoContainer .error').classList.remove('visible');

    setTimeout(function() {
        popoverVideo.classList.remove('visible');
        popoverVideo.pause();
        popoverVideo.removeAttribute('src');
        popoverVideo.load();
        popoverVideo.innerHTML = '';
    }, 300);

    window.location.hash = window.previousLocationHash;
    window.popoverIsOpen = false;

    enableScrolling();
}

function openPopover(date) {
    disableScrolling();

    let popover = document.querySelector('#popover');
    let popoverVideo = popover.querySelector('.videoContainer video');

    let day = document.querySelector(`.day[data-date='${date}']`);

    if (!day.dataset.error) {
        window.popoverIsOpen = true;
        window.previousLocationHash = window.location.hash;
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
            video.classList.add('visible');
            videoContainerLoading.classList.add('hidden');
        }   

        // Show video when it is loaded on first mouseover
        video.addEventListener('loadeddata', function(event) {
            video.classList.add('visible');
            videoContainerLoading.classList.add('hidden');
        });

        source.addEventListener('error', function(event) {
            videoContainerLoading.classList.add('hidden');
            videoContainerError.classList.add('visible');
        });

        source.setAttribute('src', `https://nycsunsetbot.leo.gd/publish/history/sunsets/${date}.mp4`);
        source.setAttribute('type', 'video/mp4');

        video.appendChild(source);
        video.currentTime = 0;
        video.play();
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
                }
            }

            day.onmouseout = () => {
                mouseIsOver = false;

                if (sunsetHasHappened) {
                    day.querySelector('.videoContainer video').classList.remove('visible');
                    day.querySelector('.videoContainer video').innerHTML = '';
                    day.querySelector('.expand').classList.remove('visible');
                    day.querySelector('.videoContainer .error').classList.remove('visible');
                }
            }

            day.onclick = () => {
                if (sunsetHasHappened) {
                    openPopover(date);
                } else {
                    alert('Sunset has not happened yet today!');
                }
            }
        }
    });
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
        if (isArrowLeft) {
            console.log('left');
        }

        if (isArrowRight) {
            console.log('right');
        }
    }
};

window.onscroll = positionNavigation;
window.onresize = positionNavigation;

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

function positionNavigation() {
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