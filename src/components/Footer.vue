<template>
  <div class="footer container-fluid">
    <div class="background"></div>
    
    <!-- Controls -->
    <b-progress height="2px" :value="playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100"  v-if="playbackTime.currentPlaybackDuration > 0"></b-progress>
    
    <div class="controls">
      <MediaControls />
    </div>
    <div class="now-playing">
      <NowPlaying />
    </div>
  </div>
</template>

<script>
// Import custom controls
import MediaControls from '../components/MediaControls.vue';
import NowPlaying from '../components/NowPlaying.vue';
import {formatMillis, formatSeconds} from '../utils';

export default {
  name: 'Footer',
  components: {
    MediaControls,
    NowPlaying
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      playbackTime: {
        currentPlaybackDuration: musicKit.player.currentPlaybackDuration,
        currentPlaybackTime: musicKit.player.currentPlaybackTime,
        currentPlaybackTimeRemaining: musicKit.player.currentPlaybackTimeRemaining
      }
    };
  },
  filters: {
    formatSeconds,
    formatMillis
  },
  created: function () {
    // Create callback functions
    this.playbackTimeDidChange = (event) => {
      this.playbackTime = event;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
  },
  destroyed: function () {
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.authorizationStatusDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
  }
};
</script>

<style scoped lang="scss">
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  height: 45px;
  font-size: 0.9em;
  padding: 8px 5px;

  border-top: 1.5px solid rgba(0, 0, 0, .2);

  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;

  background-color: rgba(210, 210, 210, 0.6);
}

.dark .footer {
    background-color: rgba(50, 50, 50, 0.6);
}

.now-playing {
  flex-grow: 2;
}

.progress {
    width: 100%;
    height: 2px;
    padding: 0px !important;
    margin: 0px !important;
    bottom: 43px !important;
    left: 0px !important;
    right: 0px !important;
    position: absolute;
    background-color: transparent !important;
}

.background {
  position: fixed;
  left: 0;
  right: 0;
  z-index: -1;
  width: 100%;
  height: 45px;

  -webkit-backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
}
</style>
