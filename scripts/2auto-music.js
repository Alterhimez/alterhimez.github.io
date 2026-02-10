document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-audio');
    const btn = document.getElementById('audio-toggle');
    const slider = document.getElementById('volume-slider');

    if (!audio) return;

    const playlist = [
        'music/0bg1.mp3','music/0bg2.mp3','music/0bg3.mp3','music/0bg4.mp3','music/0bg5.mp3',
        'music/0bg6.mp3','music/0bg7.mp3','music/0bg8.mp3','music/0bg9.mp3','music/0bg0.mp3','music/0bg10.mp3'
    ];

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    let order = shuffle(playlist);
    // start at a random index so each page load begins with a different song
    let idx = Math.floor(Math.random() * order.length);

    function loadTrack(i) {
        audio.src = order[i];
        audio.load();
        updateCurrent(); // show currently loaded
    }

    function playTrack(i) {
        if (i < 0) i = 0;
        if (i >= order.length) i = order.length - 1;
        idx = i;
        loadTrack(idx);
        audio.play().catch(() => {}); // autoplay may be blocked
        updateButton();
    }

    function nextTrack() {
        idx++;
        if (idx >= order.length) {
            order = shuffle(playlist);
            idx = 0;
        }
        playTrack(idx);
    }

    function prevTrack() {
        idx--;
        if (idx < 0) {
            order = shuffle(playlist);
            idx = order.length - 1;
        }
        playTrack(idx);
    }

    // restore volume
    try {
        const saved = localStorage.getItem('bgAudioVolume');
        audio.volume = saved !== null ? Number(saved) : 0.5;
        if (slider) slider.value = audio.volume;
    } catch (e) {}

    // find controls container (existing) — keep using .audio-controls if present
    const controlsContainer = (function findControls() {
        const ac = document.querySelector('.audio-controls');
        if (ac) return ac;
        return audio.parentNode || document.body;
    })();

    // ensure a dedicated button row exists (will host prev / play / next side-by-side)
    let btnRow = controlsContainer.querySelector('.btn-row');
    if (!btnRow) {
        btnRow = document.createElement('div');
        btnRow.className = 'btn-row';
        // insert at the top of controlsContainer so buttons appear above slider
        controlsContainer.insertBefore(btnRow, controlsContainer.firstChild);
    }

    // only create once
    let prevBtn = document.getElementById('audio-prev');
    let nextBtn = document.getElementById('audio-next');
    let currentLabel = document.getElementById('audio-current');

    if (!prevBtn) {
        prevBtn = document.createElement('button');
        prevBtn.id = 'audio-prev';
        prevBtn.className = btn ? btn.className : 'buttonpp';
        prevBtn.type = 'button';
        prevBtn.title = 'Previous';
        prevBtn.textContent = 'Prev';
        btnRow.appendChild(prevBtn); // put inside btnRow
    } else {
        // ensure it's inside btnRow
        if (prevBtn.parentNode !== btnRow) btnRow.appendChild(prevBtn);
    }

    // move existing play/pause button into btnRow so it's between prev/next
    if (btn) {
        if (btn.parentNode !== btnRow) btnRow.appendChild(btn);
        btn.style.margin = '0'; // remove inline gaps
    }

    if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.id = 'audio-next';
        nextBtn.className = btn ? btn.className : 'buttonpp';
        nextBtn.type = 'button';
        nextBtn.title = 'Next';
        nextBtn.textContent = 'Next';
        btnRow.appendChild(nextBtn); // put inside btnRow
    } else {
        if (nextBtn.parentNode !== btnRow) btnRow.appendChild(nextBtn);
    }

    // current label should appear under everything (after slider)
    if (!currentLabel) {
        currentLabel = document.createElement('div');
        currentLabel.id = 'audio-current';
        currentLabel.style.marginTop = '8px';
        currentLabel.style.fontSize = '0.9em';
        currentLabel.style.color = 'white';
        currentLabel.textContent = '';
        // append at the end of controlsContainer (below slider)
        controlsContainer.appendChild(currentLabel);
    } else {
        // ensure currentLabel sits at the end (below slider)
        if (currentLabel.parentNode === controlsContainer) controlsContainer.appendChild(currentLabel);
    }

    function friendlyName(src) {
        if (!src) return '';
        const p = src.split('/').pop();
        const name = p ? p.replace(/\.[^.]+$/, '') : src;

        // map filenames (without extension) to friendly labels
        const NAME_MAP = {
            '0bg0': 'Liryczna chłosta',
            '0bg1': 'Polish spinning toilet',
            '0bg2': 'Explosion',
            '0bg3': 'Po co wolność',
            '0bg4': 'Essa teresa',
            '0bg5': 'Not like Us',
            '0bg6': 'Trauma',
            '0bg7': 'The Fat Rat',
            '0bg8': 'Bad Apple',
            '0bg9': 'Mentore potwore, mentos momentos',
            '0bg10': 'engravings'
        };

        return NAME_MAP[name] || name;
    }

    function updateCurrent() {
        if (!currentLabel) return;
        const src = order && order[idx] ? order[idx] : audio.src;
        currentLabel.textContent = `Teraz grane: ${friendlyName(src)}`;
    }

    function updateButton() {
        if (!btn) return;
        btn.textContent = audio.paused ? 'Play audio' : (audio.muted || audio.volume === 0 ? 'Playing (muted)' : 'Pause audio');
        updateCurrent();
    }

    audio.addEventListener('ended', nextTrack);

    // try autoplay muted first to increase chance of success
    audio.muted = true;
    playTrack(idx);
    audio.play().then(() => {
        audio.muted = false;
        updateButton();
    }).catch(() => {
        updateButton();
    });

    if (btn) {
        btn.addEventListener('click', () => {
            if (audio.paused) audio.play().catch(() => {});
            else audio.pause();
            setTimeout(updateButton, 0);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevTrack();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextTrack();
        });
    }

    if (slider) {
        slider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            audio.volume = v;
            try { localStorage.setItem('bgAudioVolume', String(v)); } catch (err) {}
            audio.muted = v === 0;
            updateButton();
        });
    }

    // unmute on first user gesture if appropriate
    function onFirstGesture() {
        if (audio.muted && audio.volume > 0) {
            audio.muted = false;
            audio.play().catch(() => {});
        }
        updateButton();
        window.removeEventListener('click', onFirstGesture);
        window.removeEventListener('keydown', onFirstGesture);
        window.removeEventListener('touchstart', onFirstGesture);
    }
    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });

    updateButton();
});