
<template>
  <div id="songs-container">
    <Songs :songs="songs" :isSongsPane="true" v-if="songs" />
    <div id="loading-container">
        <Loading id="songs-loading" message="Loading..." />
    </div>
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import Songs from '../components/Songs.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyAlbums',
  components: {
    Songs,
    Loading
  },
  props: {
    title: String
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();
    let libraryManager = window.libraryManager;

    return {
      musicKit: musicKit,
      libraryManager: libraryManager,
      songs: null
    };
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }
      
      //this.songs = this.libraryManager.tracks;

      this.loading = true;

      if (!offset) {
        offset = 0;
      }

      this.musicKit.api.library.songs(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.songs) {
            this.songs = r;
          } else {
            this.songs = this.songs.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
    }
  },
  created: function () {
    this.fetch();
  },
  destroyed: function () {
    this.abort = true;
  }
};
</script>

<style scoped>
#songs-container {
    padding: 0px;
    height: 100%;
    overflow: hidden;
}
#songs-loading {
    position: absolute;
    height: 100px;
    top: 50%;
}
#loading-container {
    position: relative;
    height: 100vh;
}
</style>
