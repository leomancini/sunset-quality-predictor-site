function getOffset(element) {
    const boundingBox = element.getBoundingClientRect();

    return {
        left: boundingBox.left + window.scrollX,
        top: boundingBox.top + window.scrollY
    };
}

function goToSection(sectionId, behavior) {
    window.navigationElements.navigationItems.forEach((navigationItem) => { navigationItem.classList.remove('selected'); });
    window.navigationElements.navigation.querySelector(`.item[data-section-id='${sectionId}']`).classList.add('selected');

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

    window.location.hash = sectionId;
}

window.onload = function() {
    initialize();

    window.navigationBottomPadding = 24;
    window.navigationHeight = 44 + (window.navigationBottomPadding * 2);
    window.navigationOffset = 0;

    setTimeout(function() {
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
    }, 100);

    window.navigationElements.navigationItems.forEach((navigationItem) => {
        navigationItem.onclick = () => {
            let sectionId = navigationItem.dataset.sectionId;
            goToSection(sectionId, 'smooth');
        };
    });

    initializeCalendarInteractions();
};

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
}

function openPopover(date) {
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

        let today = new Date();
        let now = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, -1);

        if (now.split('T')[0] === date && today.getHours() < 22) {
            console.log('not yet today');
        } else {
            source.setAttribute('src', `https://nycsunsetbot.leo.gd/publish/history/sunsets/${date}.mp4`);
            source.setAttribute('type', 'video/mp4');

            video.appendChild(source);
            video.currentTime = 0;
            video.play();
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

            let mouseIsOver = false;

            day.onmouseover = () => {
                mouseIsOver = true;

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

                    let today = new Date();
                    let now = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, -1);

                    if (now.split('T')[0] === date && today.getHours() < 22) {
                        console.log('not yet today');
                    } else {
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
                    }
                } else {
                    console.log('repeat error');
                    videoContainerLoading.classList.add('hidden');
                    videoContainerError.classList.add('visible');
                }
            }

            day.onmouseout = () => {
                mouseIsOver = false;
                day.querySelector('.videoContainer video').classList.remove('visible');
                day.querySelector('.videoContainer video').innerHTML = '';
                day.querySelector('.expand').classList.remove('visible');
                day.querySelector('.videoContainer .error').classList.remove('visible');
            }

            day.onclick = () => {
                openPopover(date);
            }
        }
    });
}

document.onkeydown = function(event) {
    event = event || window.event;
    let isEscape = false;

    if ('key' in event) {
        isEscape = (event.key === 'Escape' || event.key === 'Esc');
    } else {
        isEscape = (event.keyCode === 27);
    }

    if (isEscape) {
        if (window.popoverIsOpen) { closePopover(); }
    }
};

function initialize() {
    window.navigationElements = {
        'navigation': document.querySelector('#navigation'),
        'navigationItems': document.querySelector('#navigation').querySelectorAll('.item'),
        'headerSection': document.querySelector(`section[data-section-id='latest']`),
        'allOtherSections': document.querySelector('#sections')
    };

    window.navigationElements.headerSection.style.height = `${window.innerHeight}px`;
}

window.onscroll = positionNavigation;

window.onresize = positionNavigation();

function positionNavigation() {
    initialize();
    let { navigation, headerSection, allOtherSections } = window.navigationElements;

    if (window.scrollY > (window.innerHeight - window.navigationHeight)) {
        headerSection.style.top = `${(window.innerHeight * -1) + window.navigationHeight}px`;
        headerSection.classList.add('scrolled');
        allOtherSections.style.marginTop = `${window.innerHeight + window.navigationOffset}px`;
        navigation.classList.add('scrolled');
    } else {
        headerSection.classList.remove('scrolled');
        navigation.classList.remove('scrolled');
        allOtherSections.style.marginTop = `0px`;
    }
}