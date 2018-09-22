
<template>
  <div>
    <div class="artist-header">
      <h1 v-if="artist">{{ artist.attributes.name }}</h1>
      <p v-if="artist" class="text-muted">{{ artist.relationships.albums.data.length }} {{ artist.relationships.albums.data.length | pluralize('album') }}</p>
      <div class="seperator"></div>  
    </div>

    <div class="albums-container" v-for="album in artist.relationships.albums.data" :key="album.id">
        <Album class="album" :albumType="'album'" :albumId="album.id" :isArtistList="true" v-if="artist" />
    </div>
    
    <div class="column-spacer"></div>
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';
import Loading from '../components/Loading.vue';
import Album from './Album.vue';

export default {
  name: 'Artist',
  components: {
    Album,
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
        artist: null
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
      }

      let api = this.$route.meta.isLibrary ? this.musicKit.api.library : this.musicKit.api;

      api.artist(this.$route.params.id, {
        include: 'albums'
      }).then(r => {
        this.artist = r;
        console.log(r);

        document.title = this.artist.attributes.name;

        this.loading = false;
        // TODO: Load > 100 albums
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
    console.log("created");
    this.fetch();
  },
  destroyed: function () {
    this.abort = true;
    console.log("destroyed");
  }
};
</script>

<style scoped>

h1 {
    font-size: 22px !important;
    font-weight: bold !important;
    margin-bottom: 2px !important;
}

.artist-header {
    margin-bottom: 20px;
}

.album {
    margin-bottom: 20px;
}

.albums-container {
    padding-right: 30px;
    padding-left: 2px;
}

.seperator {
    height: 1px;
    width: 100%;
    background-color: #ddd;
}
.column-spacer {
    height: 60px;
}
</style>