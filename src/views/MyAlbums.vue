
<template>
  <div id="albums-container">
    <SongCollectionList id="collection" :items="albums" countLabel="album" v-if="albums" />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import SongCollectionList from '../components/SongCollectionList.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyAlbums',
  components: {
    SongCollectionList,
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
      albums: null
    };
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }
      
      this.albums = this.libraryManager.albums;

      /*this.loading = true;

      if (!offset) {
        offset = 0;
      }

      this.musicKit.api.library.albums(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.albums) {
            this.albums = r;
          } else {
            this.albums = this.albums.concat(r);
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    
h1 {
    line-height: 2.5rem;
}

a:hover {
  text-decoration: none;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.grid .item {
  width: 200px;
  margin: 5px;
  font-size: 0.9em;
}

.item img {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-bottom: 4px;
  box-shadow: 0 0 1px rgba(0, 0, 0, .4);
}

.item span {
  display: block;
  padding: 1px 6px;
  color: black;
}

#collection {
    padding-right: 30px !important;
    padding-left: 30px !important;
}

#albums-container {
    padding-top: 60px;
}
#albums-container:after {
    content: "";
    height: 60px;
    display: block;
}
</style>

<style>
.song-cell {
  vertical-align: middle !important;
  cursor: pointer;
}
</style>
