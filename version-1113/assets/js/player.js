import { H as Hls } from './hls.js';

export function initVideoPlayer(options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const src = options.src;
    let hls = null;
    let ready = false;

    if (!video || !src) {
        return;
    }

    if (options.poster) {
        video.setAttribute('poster', options.poster);
    }

    function bindSource() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal && hls) {
                    hls.destroy();
                    hls = null;
                    ready = false;
                }
            });
        } else {
            video.src = src;
        }
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay && video.paused) {
            overlay.classList.remove('is-hidden');
        }
    }

    function startPlayback() {
        bindSource();
        hideOverlay();
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                showOverlay();
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
}
