(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const els = document.querySelectorAll('.typewriter');
        if (!els.length) return;

        els.forEach((el) => {
            // support data-words="one|two|three" or fallback to existing textContent
            const raw = (el.getAttribute('data-words') || el.textContent || '@Alterhimez[1000ms]').trim();
            const words = raw.split('|').map(s => s.trim()).filter(Boolean);
            if (words.length === 0) words.push('@Alterhimez[1000ms]');
            const longestWord = words.reduce((max, word) => word.length > max.length ? word : max, '');

            // clear original content and build structure
            el.textContent = '';
            const txt = document.createElement('span');
            txt.className = 'tw-text';
            const cursor = document.createElement('span');
            cursor.className = 'tw-cursor';
            el.appendChild(txt);
            el.appendChild(cursor);

            // lock height so container doesn't jump when word changes
            txt.textContent = longestWord;
            requestAnimationFrame(() => {
                const height = el.getBoundingClientRect().height;
                el.style.minHeight = `${height}px`;
                txt.textContent = '';
                setTimeout(tick, 1500);
            });

            const typeSpeed = Number(el.getAttribute('data-type-speed')) || 150;
            const deleteSpeed = Number(el.getAttribute('data-delete-speed')) || 150;
            const pauseAfter = Number(el.getAttribute('data-pause')) ||  2000;

            let w = 0;
            let i = 0;
            let typing = true;

            function tick() {
                const word = words[w];
                if (typing) {
                    i++;
                    txt.textContent = word.slice(0, i);
                    if (i >= word.length) {
                        typing = false;
                        setTimeout(tick, pauseAfter);
                        return;
                    }
                    setTimeout(tick, typeSpeed);
                } else {
                    i--;
                    txt.textContent = word.slice(0, i);
                    if (i <= 0) {
                        typing = true;
                        w = (w + 1) % words.length;
                        setTimeout(tick, 1500);
                        return;
                    }
                    setTimeout(tick, deleteSpeed);
                }
            }

            // start (triggered after height lock above)
            // setTimeout(tick, 1500); // ← usunięto, startujemy w requestAnimationFrame
        });
    });
})();