(function () {
    const body = document.body;
    const slideshow = document.getElementById('slideshow');
    const slidesContainer = document.querySelector('.slides');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const announcementEl = document.getElementById('announcement');
    const announcementPhoto = announcementEl?.querySelector('.announcement__photo');
    const announcementSpeaker = announcementEl?.querySelector('.announcement__speaker');
    const announcementTitle = announcementEl?.querySelector('.announcement__title');
    const announcementTime = announcementEl?.querySelector('.announcement__time');
    const announcementFinal = announcementEl?.querySelector('.announcement__final');

    if (!slideshow || slides.length === 0 || !slidesContainer) {
        return;
    }

    const config = window.__eventConfig || {};
    const talks = config.talks || [];
    let currentIndex = 0;
    let autoAdvanceTimer = null;
    const interval = Math.max(4, parseInt(config.intervalSeconds, 10) || 8) * 1000;
    let currentMode = body.dataset.mode || 'slideshow';
    let activeAnnouncementTalk = null;
    let announcementTimer = null;

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function startAutoAdvance() {
        stopAutoAdvance();
        autoAdvanceTimer = setInterval(() => {
            if (document.hidden || currentMode !== 'slideshow') return;
            goToSlide(currentIndex + 1);
        }, interval);
    }

    function stopAutoAdvance() {
        if (autoAdvanceTimer) {
            clearInterval(autoAdvanceTimer);
            autoAdvanceTimer = null;
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoAdvance();
        } else {
            startAutoAdvance();
        }
    });

    goToSlide(config.nextTalkIndex ?? 0);
    startAutoAdvance();

    // Agenda highlight update
    const agendaSlide = document.querySelector('.slide--agenda');
    const agendaItems = agendaSlide ? Array.from(agendaSlide.querySelectorAll('.agenda-item')) : [];

    function updateAgendaHighlight() {
        if (!agendaItems.length) return;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let nextIndex = null;
        talks.some((talk, index) => {
            const [hours, minutes] = talk.time.split(':').map(Number);
            const talkMinutes = hours * 60 + minutes;
            if (talkMinutes >= currentMinutes) {
                nextIndex = index;
                return true;
            }
            return false;
        });

        agendaItems.forEach((item, index) => {
            item.classList.toggle('agenda-item--next', index === nextIndex);
        });
    }

    updateAgendaHighlight();
    setInterval(updateAgendaHighlight, 60 * 1000);

    // Announcement handling
    function applyAnnouncement(talkIndex) {
        const talk = talks[talkIndex];
        if (!talk || !announcementEl) return;

        body.classList.add('showing-announcement');
        announcementEl.hidden = false;
        if (announcementFinal) {
            announcementFinal.hidden = true;
        }

        if (announcementTimer) {
            clearTimeout(announcementTimer);
            announcementTimer = null;
        }

        const inner = announcementEl.querySelector('.announcement__inner');
        if (inner) {
            inner.style.animation = 'none';
            // trigger reflow to restart animation
            void inner.offsetWidth;
            inner.style.animation = '';
        }

        if (announcementPhoto) {
            announcementPhoto.src = talk.photo;
        }
        if (announcementSpeaker) {
            announcementSpeaker.textContent = talk.speaker;
        }
        if (announcementTitle) {
            announcementTitle.textContent = talk.title;
        }
        if (announcementTime) {
            announcementTime.textContent = `Start: ${talk.time}`;
        }

        // orchestrate final green screen after delay
        announcementTimer = setTimeout(() => {
            if (announcementFinal) {
                announcementFinal.hidden = false;
            }
        }, 12000);
    }

    function clearAnnouncement() {
        if (!announcementEl) return;
        if (announcementTimer) {
            clearTimeout(announcementTimer);
            announcementTimer = null;
        }
        announcementEl.hidden = true;
        if (announcementFinal) {
            announcementFinal.hidden = true;
        }
        body.classList.remove('showing-announcement');
    }

    function handleStateUpdate(state) {
        const mode = state.mode || 'slideshow';
        const talkIndex = typeof state.activeTalk === 'number' ? state.activeTalk : null;

        if (mode !== currentMode) {
            currentMode = mode;
            if (mode === 'slideshow') {
                clearAnnouncement();
                startAutoAdvance();
            } else {
                stopAutoAdvance();
            }
        }

        if (mode === 'announcement') {
            if (talkIndex !== null && talkIndex !== activeAnnouncementTalk) {
                activeAnnouncementTalk = talkIndex;
                applyAnnouncement(talkIndex);
            }
        } else {
            activeAnnouncementTalk = null;
        }
    }

    async function pollState() {
        try {
            const response = await fetch('state.php', { cache: 'no-store' });
            if (!response.ok) return;
            const data = await response.json();
            handleStateUpdate(data);
        } catch (error) {
            console.error('Nie udało się pobrać stanu pokazu slajdów.', error);
        }
    }

    pollState();
    setInterval(pollState, 5000);
})();
