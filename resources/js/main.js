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
    window.navigationElements = {
        'navigation': document.querySelector('#navigation'),
        'navigationItems': document.querySelector('#navigation').querySelectorAll('.item'),
        'navigationBlur': document.querySelector('#navigationBlur'),
        'headerSection': document.querySelector(`section[data-section-id='latest-prediction']`),
        'allOtherSections': document.querySelector('#sections')
    };

    window.navigationBottomPadding = 24;
    window.navigationHeight = 44 + (window.navigationBottomPadding * 2);
    window.navigationOffset = 0;

    initialize();

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
};

function initialize() {
    window.navigationElements.headerSection.style.height = `${window.innerHeight}px`;
}

window.onscroll = positionNavigation;

window.onresize = () => {
    initialize();
    positionNavigation();
};

function positionNavigation() {
    let { navigation, headerSection, allOtherSections } = window.navigationElements;

    if (window.scrollY > (window.innerHeight - window.navigationHeight)) {
        headerSection.style.top = `${(window.innerHeight * -1) + window.navigationHeight}px`;
        headerSection.classList.add('scrolled');
        allOtherSections.style.marginTop = `${window.innerHeight + window.navigationOffset}px`;
        navigation.classList.add('scrolled');
        navigationBlur.classList.add('scrolled');
    } else {
        headerSection.classList.remove('scrolled');
        navigation.classList.remove('scrolled');
        navigationBlur.classList.remove('scrolled');
        allOtherSections.style.marginTop = `0px`;
    }
}