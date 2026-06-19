document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("[data-video]");
  var button = document.querySelector("[data-play]");

  if (!video) {
    return;
  }

  var source = video.getAttribute("data-src");
  var hlsInstance = null;

  function bindSource() {
    if (!source || video.getAttribute("data-ready") === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "1");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.setAttribute("data-ready", "1");
      return;
    }

    video.src = source;
    video.setAttribute("data-ready", "1");
  }

  function startPlayback() {
    bindSource();
    video.controls = true;
    document.body.classList.add("is-playing");
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  video.addEventListener("click", startPlayback);

  if (button) {
    button.addEventListener("click", startPlayback);
  }
});
