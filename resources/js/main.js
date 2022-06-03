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

window.onmousemove = function (e) {
    let offset = 24;

    if (window.hoveringOverDayWithoutVideo) {
        window.navigationElements.dayWithoutVideoTooltip.style.top = (e.clientY + offset) + 'px';
        window.navigationElements.dayWithoutVideoTooltip.style.left = (e.clientX + offset) + 'px';  
    }
};

window.onresize = () => {
    positionNavigation({ trigger: 'resize' });

    if (window.popoverIsOpen) {
        document.querySelector('#popover .videoContainer video').style.height = null;
        document.querySelector('#popover .videoContainer video').style.height = `${document.querySelector('.videoContainer video').offsetHeight}px`;

        centerVideoNavigation();
    }
};

window.onload = initialize;

function initialize() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.isMobile = true;
    }

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

                if (window.location.hash === '#latest') {
                    document.querySelector('#navigation').classList.add('preVisible');
                    disableScrolling();
                }
            }
        } else {
            document.querySelector('#navigation').classList.add('preVisible');
            disableScrolling();
        }

        setTimeout(() => {
            document.querySelector('#curtain').classList.remove('visible');
            window.navigationElements.headerSection.querySelector('#content').classList.add('visible');

            if (window.navigationElements.navigation.classList.contains('preVisible')) {
                setTimeout(() => {
                    window.navigationElements.navigation.classList.add('visible');

                    setTimeout(() => {
                        window.navigationElements.navigation.classList.remove('preVisible');
                        enableScrolling();
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

    positionNavigation({ trigger: 'load' });

    initializeCalendarInteractions();
}

function positionNavigation(params) {
    if (window.isMobile) {
        let viewportHeight;

        if (params.trigger === 'load') {
            document.querySelector(`section[data-section-id='latest']`).style.height = `${window.innerHeight}px`;
            window.viewportHeight = window.innerHeight;
        } else {
            if (params.trigger !== 'resize') {
                if (window.pageYOffset > (window.viewportHeight - window.navigationHeight)) {
                    document.querySelector(`section[data-section-id='latest']`).style.top = `${(window.viewportHeight * -1) + window.navigationHeight}px`;
                    document.querySelector(`section[data-section-id='latest']`).classList.add('scrolled');
                    document.querySelector('#sections').style.marginTop = `${window.viewportHeight + window.navigationOffset}px`;
                    document.querySelector('#navigation').classList.add('scrolled');
                } else {
                    document.querySelector(`section[data-section-id='latest']`).classList.remove('scrolled');
                    document.querySelector('#navigation').classList.remove('scrolled');
                    document.querySelector('#sections').style.marginTop = `0px`;
                }
            }
        }
    } else {
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
    }

    if (params.trigger !== 'load') {
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