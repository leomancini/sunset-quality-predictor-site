function initializeCalendarInteractions() {
    let calendar = document.querySelector('#calendar');
    let days = calendar.querySelectorAll('.day');

    let popoverBackground = document.querySelector('#popoverBackground');
    let popoverCloseButton = document.querySelector('#popoverBackground #popoverCloseButton');

    if (window.isMobile || window.isTablet) {
        popoverCloseButton.onclick = closePopover;
    } else {
        popoverBackground.onclick = closePopover;
    }

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
            let expandButton = day.querySelector('.expand');
            let videoContainer = day.querySelector('.videoContainer');
            let videoContainerLoading = videoContainer.querySelector('.loading');
            let videoContainerError = videoContainer.querySelector('.error');

            let date = day.dataset.date;
            let today = new Date();
            let now = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, -1);

            let sunsetHasHappened = true;

            if (now.split('T')[0] === date && today.getHours() < 23) {
                sunsetHasHappened = false;
                day.classList.add('sunsetHasNotHappenedYet');
            }

            if (!window.isMobile && !window.isTablet) {
                let mouseIsOver = false;

                day.onmouseover = () => {
                    mouseIsOver = true;

                    if (sunsetHasHappened) {
                        let video = videoContainer.querySelector('video');
                        let source = document.createElement('source');

                        if (!day.dataset.error) {
                            videoContainerLoading.classList.remove('hidden');

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
                    videoContainerLoading.classList.add('hidden');

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
            }

            day.onclick = () => {
                if (sunsetHasHappened) {
                    openPopover(date, null);
                } else {
                    if (window.isMobile || window.isTablet) {
                        alert(`Sunset video not ready for ${day.dataset.dateFormatted}. Check again after 10 PM Eastern Time.`);
                    }
                }
            }
        }
    });
}