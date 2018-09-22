
<template>
  <div>
    <!--<p class="text-muted">{{ songs.length }} {{ songs.length | pluralize('song') }}, {{ duration | humanize }}</p>-->
    
    <div class="song-row text-muted header" v-if="isSongsPane">
        <p class="artwork-cell">Song</p>
        <p class="song-cell"></p>
        <p class="song-cell" v-if="!isAlbum">Artist</p>
        <p class="song-cell" v-if="!isAlbum">Album</p>
        <p class="actions-cell"></p>
        <p class="time-cell">Time</p>
    </div>
    
    <recycle-list id="songs-table" :items="songs" :itemHeight="45" v-if="isSongsPane">
      <template slot-scope="data">
        <div class="song-row" :key="data.id" @click="clicked(data.item, 0, 0)">
            <div class="artwork-cell"> 
                <div v-if="isAlbum">       
                    <div v-if="!isPlaying(data.item)">
                        {{ data.item.attributes.trackNumber }}
                    </div>
                    <div v-else>
                        <div class="album-playing-indicator">
                            <i class="fa fa-volume-up"></i>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <lazy-img v-if="data.item.attributes && data.item.attributes.artwork"
                         :src="data.item.attributes.artwork | formatArtworkURL(40)" />
                    <div class="playing-indicator" v-if="isPlaying(data.item)">
                      <i class="fa fa-volume-up"></i>
                    </div>
                </div>
            </div>
            <div class="song-cell name-cell">{{ data.item.attributes.name }}</div>
            <div class="song-cell" v-if="!isAlbum">{{ data.item.attributes.artistName }}</div>
            <div class="song-cell" v-if="!isAlbum">{{ data.item.attributes.albumName }}</div>
            <div class="actions-cell">
                <b-dropdown variant="link" size="sm" no-caret right>
                <template slot="button-content">
                    <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
                </template>

                <b-dropdown-item-button @click.stop="addToLibrary(data)" v-if="isAuthorized">Add to library</b-dropdown-item-button>
                <b-dropdown-divider  v-if="isAuthorized" />
                <b-dropdown-item-button @click.stop="queueNext(data)">Play next</b-dropdown-item-button>
                <b-dropdown-item-button @click.stop="queueLater(data)">Play later</b-dropdown-item-button>
              </b-dropdown>
            </div>
            <div class="time-cell"> {{ formatMillis(data.item.attributes.durationInMillis) }}</div>
        </div>
      </template>
      
    </recycle-list>

    <b-table id="songs-table-album" :items="songs" :fields="fields" hover v-on:row-clicked="clicked" v-if="!isSongsPane">
      <template slot="attributes.artwork" slot-scope="data">
        <lazy-img v-if="data.item.attributes && data.item.attributes.artwork"
             :src="data.item.attributes.artwork | formatArtworkURL(40)" />
        <div class="playing-indicator" v-if="isPlaying(data.item)">
          <i class="fa fa-volume-up"></i>
        </div>
      </template>

      <template slot="attributes.trackNumber" slot-scope="data">
        <div v-if="!isPlaying(data.item)">
          {{ data.item.attributes.trackNumber }}
        </div>
        <div v-else>
          <div class="album-playing-indicator">
            <i class="fa fa-volume-up"></i>
          </div>
        </div>
      </template>

      <template slot="name" slot-scope="data">
        <span v-if="data.item.attributes">{{ data.item.attributes.name }}</span>
      </template>
      
      <template slot="attributes.artistName" slot-scope="data">
        <span v-if="showArtist && data.item.attributes">{{ data.item.attributes.artistName }}</span>
      </template>

      <template slot="actions" slot-scope="data">
        <b-dropdown variant="link" size="sm" no-caret right>
          <template slot="button-content">
            <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
          </template>

          <b-dropdown-item-button @click.stop="addToLibrary(data)" v-if="isAuthorized">Add to library</b-dropdown-item-button>
          <b-dropdown-divider  v-if="isAuthorized" />
          <b-dropdown-item-button @click.stop="queueNext(data)">Play next</b-dropdown-item-button>
          <b-dropdown-item-button @click.stop="queueLater(data)">Play later</b-dropdown-item-button>
        </b-dropdown>
      </template>
    </b-table>
        
  </div>

</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';
import LazyImg from './LazyImg';
import {formatArtworkURL, formatMillis, humanize} from '../utils';

export default {
  name: 'Songs',
  components: {
      LazyImg, 
  },
  props: {
    isAlbum: Boolean,
    isSongsPane: Boolean,
    title: String,
    songs: Array
  },
  computed: {
    duration: function () {
      return this.songs.reduce((total, song) => total + ((song.attributes || {}).durationInMillis || 0), 0);
    },
    showArtist: function () {
      const artist =
          this.songs.length > 0 ? this.songs[0].attributes.artistName : '';
      const allArtistsMatch =
          this.songs.every(item => item.attributes.artistName === artist);
      return !(this.isAlbum && allArtistsMatch);
    }
  },
  filters: {
    formatArtworkURL,
    humanize
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      isAuthorized: musicKit.isAuthorized,
      nowPlayingItem: musicKit.player.nowPlayingItem,
      fields: [ ]
    };
  },
  methods: {
    formatMillis: function(value) {
        return formatMillis(value);
    },
    clicked: function (item, index, event) {
      this.play(item);
    },
    trackToMediaItem (track) {
      return {
        attributes: track.attributes,
        id: track.id,
        container: {
          id: track.id
        }
      };
    },
    play: function (item) {
      if (this.$localStorage.get('queueAllSongs')) {
        this.musicKit.setQueue({
          items: this.songs.map(i => this.trackToMediaItem(i)),
          startPosition: this.songs.indexOf(item)
        }).then(() => {
          this.musicKit.play().catch(err => console.error(err));
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
      } else {
        this.musicKit.setQueue({
          items: [ this.trackToMediaItem(item) ]
        }).then(queue => {
          this.musicKit.play().catch(err => {
            Raven.captureException(err);

            EventBus.$emit('alert', {
              type: 'danger',
              message: `The song could not be played.`
            });
          });
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `The song could not be played.`
          });
        });
      }
    },
    addToLibrary: function (item) {
      this.musicKit.api.addToLibrary({
        songs: [ item.item.id ]
      }).then(() => {
        EventBus.$emit('alert', {
          type: 'success',
          message: `Successfully added "${item.item.attributes.name}" to your library.`
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An error occurred while adding "${item.item.attributes.name}" to your library.`
        });
      });
    },
    queueNext (item) {
      let mediaItem = this.trackToMediaItem(item.item);
      this.musicKit.player.queue.prepend({ items: [mediaItem] });
    },
    queueLater (item) {
      let mediaItem = this.trackToMediaItem(item.item);
      this.musicKit.player.queue.append({ items: [mediaItem] });
    },
    isPlaying (item) {
      if (!this.nowPlayingItem) {
        return false;
      }
      return item.id === this.nowPlayingItem.id ||
        item.id === this.nowPlayingItem.container.id ||
        item.id === this.nowPlayingItem.sourceId;
    }
  },
  created: function () {
    this.fields = [
      { key: 'attributes.artwork', label: 'Song', tdClass: 'song-cell-album' },
      { key: 'attributes.trackNumber', label: 'Song', tdClass: 'song-cell-album' },
      { key: 'name', label: '', tdClass: 'song-cell-album' },
      { key: 'attributes.artistName', label: 'Artist', tdClass: 'song-cell-album' },
      { key: 'attributes.albumName', label: 'Album', tdClass: 'song-cell-album' },
      { key: 'actions', label: '', tdClass: 'actions-cell-album' },
      { key: 'attributes.durationInMillis', label: 'Time', tdClass: 'song-cell-album', formatter: value => formatMillis(value) }
    ];

    if (this.isAlbum) {
      // Don't show album art and name for album entities.
      this.fields.splice(0, 1);
      this.fields.splice(2, 1);
      this.fields.splice(2, 1);
    } else {
      // Don't show track number for non-album entities.
      this.fields.splice(1, 1);
    }

    this.mediaItemDidChange = (event) => {
      this.nowPlayingItem = event.item;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);

    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  },
  destroyed: function () {
    this.musicKit.removeEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  $art-radius: 4px;
  $art-size: 40px;

img {
  width: $art-size;
  height: $art-size;
  border-radius: $art-radius;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

.playing-indicator {
  background-color: rgba(0, 0, 0, .3);
  border-radius: $art-radius;
  color: #fff;
  font-size: 24px;
  height: $art-size;
  line-height: 42px;
  margin-top: -42px;
  position: absolute;
  text-align: center;
  width: $art-size;
}

.album-playing-indicator {
  color: #007bff;
  font-size: 15px;
  height: 40px !important;
}

#songs-table {
    background-color: transparent;
    height: 100vh;
    overflow-y: auto;
    padding-top: 70px;
    padding-bottom: 60px;
    min-width: 400px;
}

#songs-table .item {
  height: 45px;
}

#songs-table:after {
    content: "";
    height: 60px;
    display: block;
}

#songs-table-album {
    background-color: transparent;
    height: 100%;
    min-width: 400px;
}
</style>

<style scoped>
/* Styles for isSongsPane */
    
.song-row {
    display: flex; 
    border-bottom: 1px solid rgba(0, 0, 0, .1);
}

.dark .song-row {
    border-bottom: 1px solid rgba(150,150,150,.2) !important;
}

.song-row:hover {
    background-color: #eee;
}

.dark .song-row:hover {
    background-color: #333 !important;
}

.song-cell, .actions-cell, .time-cell, .artwork-cell {
    display: inline-block;
    vertical-align: middle !important;
    cursor: pointer;
    padding: 0px 5px 0px 5px;
    text-overflow: ellipsis;
    height: 45px !important;
    line-height: 45px;
}

.song-cell {
    width: 30%;
}

.actions-cell {
  width: 40px;
}

.time-cell {
    width: 50px;
}

.artwork-cell {
    width: 55px;
    padding-left: 10px;
    padding-right: 2px;
}

.name-cell {
    padding-left: 10px;
}

.header {
    text-transform: uppercase;
    font-size: 12px;
    color: #777 !important;
    font-weight: normal;
    text-align: left !important;
    position: absolute;
    height: 24px;
    width: 85%;
    top: 39px;
    z-index: 2;
    background-color: white;
    border-bottom: 1px solid rgba(0, 0, 0, .2);
}

.dark .header {
    background-color: #333 !important;
}

.header p {
    position: relative;
    display: flex;
    height: 20px !important;
    line-height: 24px;
}

.song-cell:first-child {
  width: 20px;
}
.song-cell:last-child {
  width: 40px;
  text-align: right !important;
  padding-right: 10px !important;
}
</style>

<style scoped>
/* Styles for !isSongsPane */

.song-cell-album, .actions-cell-album {
    vertical-align: middle !important;
    cursor: pointer;
    padding: 0px 5px 0px 5px !important;
    text-overflow: ellipsis;
    height: 40px !important;
    border-top: 0 !important;
}
    
.actions-cell-album {
    width: 20px;
}
    
</style>
