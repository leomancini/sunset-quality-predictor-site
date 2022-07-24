function openPopover(date, onError) {
    disableScrolling();

    let popover = document.querySelector('#popover');
    let popoverVideoContainer = popover.querySelector('.videoContainer video');
    let popoverVideo = popover.querySelector('.videoContainer video');

    let day = document.querySelector(`.day[data-date='${date}']`);

    if (!window.popoverIsOpen) {
        setVideoHeight();
        centerVideoNavigation();
    }

    if (day && !day.dataset.error) {
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

        // Show video if it is already loaded
        if (video.readyState === 4) {
            videoContainerLoading.classList.add('hidden');

            setVideoHeight();
            centerVideoNavigation();

            setTimeout(() => {
                video.classList.add('visible');
                video.play();
            }, 300);
        }   

        // Show video when it is finished loading
        video.addEventListener('loadeddata', function(event) {
            videoContainerLoading.classList.add('hidden');

            setVideoHeight();
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

function resetPopover() {
    let popover = document.querySelector('#popover');
    let popoverVideoContainer = popover.querySelector('.videoContainer');
    let popoverVideo = popoverVideoContainer.querySelector('.videoContainer video');

    popoverVideo.classList.remove('visible');

    popoverVideoContainer.querySelector('.loading').classList.remove('hidden');
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

function centerVideoNavigation() {
    if (!window.isMobile) {
        document.querySelector('#popover .navigation.left').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;
        document.querySelector('#popover .navigation.right').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;
    }
}

function setVideoHeight() {
    let videoSize = {
        width: 1920,
        height: 1080
    };

    let popover = document.querySelector('#popover');
    let videoContainer = popover.querySelector('.videoContainer');

    videoContainer.style.height = `${Math.round(popover.offsetWidth * (videoSize.height / videoSize.width))}px`;
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