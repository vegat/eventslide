(function () {
    const body = document.body;
    const slideshow = document.getElementById('slideshow');
    const slidesContainer = document.querySelector('.slides');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const announcementEl = document.getElementById('announcement');
    const announcementPhoto = announcementEl?.querySelector('.announcement__photo');
    const announcementSpeaker = announcementEl?.querySelector('.announcement__speaker');
    const announcementTitleText = announcementEl?.querySelector('.announcement__title-text');
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
    let currentAnnouncementSequence = null;

    const ANNOUNCEMENT_STAGE_CLASSES = [
        'announcement--visible',
        'announcement--show-inner',
        'announcement--show-photo',
        'announcement--show-speaker',
        'announcement--show-time',
        'announcement--show-title',
        'announcement--final-stage',
    ];

    function createSequence() {
        return {
            cancelled: false,
            timeouts: [],
            cancelCallbacks: [],
        };
    }

    function cancelSequence(sequence) {
        if (!sequence) return;
        sequence.cancelled = true;
        sequence.timeouts.forEach((id) => clearTimeout(id));
        sequence.timeouts = [];
        sequence.cancelCallbacks.forEach((callback) => {
            try {
                callback();
            } catch (error) {
                console.error('Błąd podczas zatrzymywania animacji zapowiedzi.', error);
            }
        });
        sequence.cancelCallbacks = [];
    }

    function schedule(sequence, fn, delay) {
        if (!sequence || sequence.cancelled) return;
        const timeoutId = setTimeout(() => {
            if (sequence.cancelled) return;
            sequence.timeouts = sequence.timeouts.filter((id) => id !== timeoutId);
            fn();
        }, delay);
        sequence.timeouts.push(timeoutId);
    }

    function startTypewriter(sequence, target, text) {
        if (!sequence || sequence.cancelled || !target) return;

        let cursor = target.querySelector('.announcement__title-cursor');
        if (cursor) {
            cursor.remove();
        }

        target.textContent = '';
        target.classList.remove('is-finished');
        target.classList.add('is-typing');

        cursor = document.createElement('span');
        cursor.className = 'announcement__title-cursor';
        cursor.textContent = '';
        target.appendChild(cursor);

        const cancelTyping = () => {
            if (cursor.parentNode === target) {
                cursor.remove();
            }
            target.classList.remove('is-typing');
        };
        sequence.cancelCallbacks.push(cancelTyping);

        let index = 0;

        function typeNext() {
            if (sequence.cancelled) {
                cancelTyping();
                return;
            }
            if (index < text.length) {
                target.insertBefore(document.createTextNode(text.charAt(index)), cursor);
                index += 1;
                const delay = 70 + Math.random() * 60;
                const timeoutId = setTimeout(() => {
                    sequence.timeouts = sequence.timeouts.filter((id) => id !== timeoutId);
                    typeNext();
                }, delay);
                sequence.timeouts.push(timeoutId);
            } else {
                cancelTyping();
                target.textContent = text;
                target.classList.add('is-finished');
                sequence.cancelCallbacks = sequence.cancelCallbacks.filter((cb) => cb !== cancelTyping);
            }
        }

        typeNext();
    }

    function resetAnnouncementVisuals() {
        if (!announcementEl) return;
        announcementEl.classList.remove(...ANNOUNCEMENT_STAGE_CLASSES);
        if (announcementFinal) {
            announcementFinal.hidden = true;
            announcementFinal.classList.remove('announcement__final--visible');
        }
        if (announcementTitleText) {
            const existingCursor = announcementTitleText.querySelector('.announcement__title-cursor');
            if (existingCursor) {
                existingCursor.remove();
            }
            announcementTitleText.textContent = '';
            announcementTitleText.classList.remove('is-typing', 'is-finished');
        }
        if (announcementSpeaker) {
            announcementSpeaker.textContent = '';
        }
        if (announcementTime) {
            announcementTime.textContent = '';
        }
    }

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

        cancelSequence(currentAnnouncementSequence);
        currentAnnouncementSequence = createSequence();
        const sequence = currentAnnouncementSequence;

        body.classList.add('showing-announcement');
        announcementEl.hidden = false;
        resetAnnouncementVisuals();

        if (announcementPhoto) {
            announcementPhoto.src = talk.photo;
            announcementPhoto.alt = talk.speaker ? `Zdjęcie ${talk.speaker}` : 'Zdjęcie prelegenta';
        }
        if (announcementSpeaker) {
            announcementSpeaker.textContent = talk.speaker;
        }
        if (announcementTime) {
            announcementTime.textContent = `Start: ${talk.time}`;
        }

        const titleText = typeof talk.title === 'string' ? talk.title : '';

        requestAnimationFrame(() => {
            if (sequence.cancelled) return;
            announcementEl.classList.add('announcement--visible');
        });

        const innerDelay = 600;
        const photoDelay = 1400;
        const speakerDelay = 2100;
        const timeDelay = 2700;
        const titleDelay = 3300;
        const typeDuration = Math.max(3200, titleText.length * 95);
        const finalDelay = titleDelay + typeDuration + 6500;

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--show-inner');
        }, innerDelay);

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--show-photo');
        }, photoDelay);

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--show-speaker');
        }, speakerDelay);

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--show-time');
        }, timeDelay);

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--show-title');
            startTypewriter(sequence, announcementTitleText, titleText);
        }, titleDelay);

        schedule(sequence, () => {
            announcementEl.classList.add('announcement--final-stage');
            if (announcementFinal) {
                announcementFinal.hidden = false;
                requestAnimationFrame(() => {
                    announcementFinal.classList.add('announcement__final--visible');
                });
            }
        }, finalDelay);
    }

    function clearAnnouncement() {
        if (!announcementEl) return;
        cancelSequence(currentAnnouncementSequence);
        currentAnnouncementSequence = null;
        resetAnnouncementVisuals();
        announcementEl.hidden = true;
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
