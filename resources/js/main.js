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

    if (sectionId === 'latest-prediction') {
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
            let sectionId = window.location.hash.split('#').join('');
            goToSection(sectionId);
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

function initializeCalendarInteractions() {
    let calendar = document.querySelector('#calendar');
    let days = calendar.querySelectorAll('.day');

    days.forEach((day) => {
        if (day.classList.contains('filled')) {
            let date = day.dataset.date;
            let popover = day.querySelector('.popover');

            day.onmouseover = () => {
                popover.classList.add('visible');

                let videoContainer = popover.querySelector('.videoContainer');
                let videoContainerLoading = videoContainer.querySelector('.loading');
                let videoContainerError = videoContainer.querySelector('.error');
                let video = videoContainer.querySelector('video');
                let source = document.createElement('source');

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
            };

            day.onmouseout = () => {
                popover.classList.remove('visible');

                popover.querySelector('video').innerHTML = '';
            };
        }
    });
}

function initialize() {
    window.navigationElements = {
        'navigation': document.querySelector('#navigation'),
        'navigationItems': document.querySelector('#navigation').querySelectorAll('.item'),
        'headerSection': document.querySelector(`section[data-section-id='latest-prediction']`),
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