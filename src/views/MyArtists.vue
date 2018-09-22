
<template>
    <div>
        <div class="artists-container">
            <Artists class="sidebar column" :artists="artists" v-if="artists" />
            <router-view class="content column"></router-view>
        </div>
    </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import Artists from '../components/Artists.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyArtists',
  components: {
    Artists,
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
      artists: null
    };
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }
      
      this.artists = this.libraryManager.artists;

      /*this.loading = true;
      

      if (!offset) {
        offset = 0;
      }

      this.musicKit.api.library.artists(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.artists) {
            this.artists = r;
          } else {
            this.artists = this.artists.concat(r);
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
        });*/
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
    .artists-container {
        display: flex;
        padding: 0px;
        margin-left: 0px;
    }
    
    .sidebar {
        width: 17%;
        padding-top: 60px;
        padding-right: 10px;
    }  
    
    .content {
        flex-grow: 100;
        margin: 0px;
        padding-top: 60px;
    }
    
    .column {
        overflow: auto;
        overflow-y: scroll;  
        max-height: 100vh;
    }  
</style>