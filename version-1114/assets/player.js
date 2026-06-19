(function () {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play");
    var data = document.getElementById("play-data");
    var hls = null;
    var sourceReady = null;

    function readSource() {
        if (!data) {
            return "";
        }

        try {
            return JSON.parse(data.textContent).url || "";
        } catch (error) {
            return "";
        }
    }

    function setMessage(text) {
        if (!button) {
            return;
        }

        var label = button.querySelector("span");

        if (label) {
            label.textContent = text;
        }
    }

    function attachSource() {
        if (!video) {
            return Promise.resolve();
        }

        var url = readSource();

        if (!url) {
            return Promise.resolve();
        }

        if (sourceReady) {
            return sourceReady;
        }

        sourceReady = new Promise(function (resolve) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                resolve();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function (event, info) {
                    if (info && info.fatal) {
                        setMessage("重试");
                    }
                });
                return;
            }

            video.src = url;
            resolve();
        });

        return sourceReady;
    }

    function play() {
        attachSource().then(function () {
            if (button) {
                button.classList.add("is-hidden");
            }

            var request = video.play();

            if (request && request.catch) {
                request.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (button && video) {
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
