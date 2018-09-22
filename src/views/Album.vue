
<template>
  <div class="album-container" v-bind:class="{'album-container-full': !isArtistList}" v-if="collection">
        <div v-bind:class="{'left-small': isArtistList}" class="left column">
          <div class="artwork-image">
              <img v-if="collection.attributes.artwork && !isArtistList"
                   :src="collection.attributes.artwork | formatArtworkURL(300)"
                   class="pull-left"
                   alt="" />
              <img v-if="collection.attributes.artwork && isArtistList"
                   :src="collection.attributes.artwork | formatArtworkURL(150)"
                   class="pull-left small-artwork"
                   alt="" />
              <button class="play-button" v-bind:class="{'play-button-small': isArtistList}" v-on:click="play()">
                  <i class="fa fa-play"></i>
              </button>
          </div>
             
          <div class="left-info album-container">
               <p v-if="isArtistList" class="text-muted">{{ collection.relationships.tracks.data.length }} {{ collection.relationships.tracks.data.length | pluralize('song') }}</p>
               <p v-else class="text-muted">{{ collection.relationships.tracks.data.length }} {{ collection.relationships.tracks.data.length | pluralize('song') }} • {{ duration | humanize }}</p>
               <p class="actions">
                 <a href="#" v-on:click.prevent="shuffle()">Shuffle <i class="fas fa-random"></i></a>
               </p>
          </div>
          
          <div v-if="!isArtistList" class="seperator"></div>
          
          <p class="album-description" v-if="collection.attributes.description">{{ collection.attributes.description.standard }}</p>
        </div>
        <div class="right column">
          <div class="info">
            <h1>{{ collection.attributes.name }}</h1>
            <router-link v-if="!isArtistList && !isPlaylist" class="artist-name" :to="{ name: 'artists', params: { id: collection.attributes.artistName } }">
                {{ collection.attributes.artistName }}
            </router-link>

            <p v-if="!isPlaylist" class="extra-info text-muted">
                Unknown genre • 1971
            </p>
            
            <a href="#" v-if="collection.attributes.curatorName" class="artist-name">
                {{ collection.attributes.curatorName }}
            </a>

            <p class="text-uppercase actions">
              <ul class="list-unstyled">
                <!--<li><a href="#" v-on:click.prevent="play()">Play all</a></li>-->
                <!--<li v-if="isAuthorized && !$route.meta.isLibrary"><a href="#" v-on:click.prevent="addToLibrary()">Add to library</a></li>-->
              </ul>
            </p>
          </div>
      
          <Songs v-bind:class="{'album-songs': !isArtistList}" :songs="collection.relationships.tracks.data"
                 :isAlbum="!isPlaylist" />
        </div>
  </div>
  <div v-else>
    <Loading message="" />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import Songs from '../components/Songs.vue';
import Loading from '../components/Loading.vue';
import {formatArtworkURL, playItem, formatMillis, humanize} from '../utils';

export default {
  name: 'Album',
  filters: {
    formatArtworkURL,
    humanize
  },
  components: {
    Songs,
    Loading
  },
  computed: {
    duration: function () {
      return this.collection.relationships.tracks.data.reduce((total, song) => total + ((song.attributes || {}).durationInMillis || 0), 0);
    },
  },
  props: {
    isArtistList: Boolean,
    isPlaylist: Boolean,
    albumId: String,
    albumType: String,
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      isAuthorized: musicKit.isAuthorized,
      collection: null
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    fetch: function () {
      if (this.abort) {
        return;
      }

      this.loading = true;
      this.collection = null;

      let api = this.$route.meta.isLibrary ? this.musicKit.api.library : this.musicKit.api;

      let albumId = this.albumId != null ? this.albumId : this.$route.params.id;
      let albumType = this.albumType != null ? this.albumType : this.$route.meta.type;

      api[albumType](albumId).then(r => {
        this.collection = r;

        if (!this.isArtistList) {
            document.title = this.collection.attributes.name; 
        }

        // Workaround to load all songs
        let fetchTracks = (url) => {
          var headers = new Headers({
            Authorization: 'Bearer ' + this.musicKit.developerToken,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Music-User-Token': '' + this.musicKit.musicUserToken
          });
          fetch('https://api.music.apple.com' + url, { headers: headers })
            .then(res => res.json())
            .then(res => {
              this.collection.relationships.tracks.data = this.collection.relationships.tracks.data.concat(res.data);
              if (!this.abort && res.next) {
                fetchTracks(res.next);
              } else {
                this.loading = false;
              }
            });
        };
        if (r.relationships.tracks.next) {
          fetchTracks(r.relationships.tracks.next);
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
    },
    play: function () {
      playItem(this.collection);
    },
    shuffle: function () {
      // Temporary shuffle implementation until supported in MusicKit JS.
      var tracks = this.collection.relationships.tracks.data.slice();
      tracks.sort(i => 0.5 - Math.random());

      this.musicKit.setQueue({
        items: tracks.map(i => {
          return {
            attributes: i.attributes,
            id: i.id,
            container: {
              id: i.id
            }
          };
        })
      }).then(queue => {
        this.musicKit.play().catch(err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An unexpected error occurred.`
        });
      });
    },
    addToLibrary: function () {
      this.musicKit.api.addToLibrary({
        [this.collection.type]: [ this.collection.id ]
      }).then(() => {
        EventBus.$emit('alert', {
          type: 'success',
          message: `Successfully added "${this.collection.attributes.name}" to your library.`
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An error occurred while adding "${this.collection.attributes.name}" to your library.`
        });
      });
    }
  },
  created: function () {
    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);

    this.fetch();
  },
  destroyed: function () {
    this.abort = true;

    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
img {
  width: 300px;
  height: 300px;
  border-radius: 8px;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

.small-artwork {
    width: 150px;
    height: 150px;
    border-radius: 8px;
}

.header {
  overflow: hidden;
  margin-bottom: 10px;
}

.actions li {
  display: inline-block;
}

.actions li::after {
  content: '|';
  padding: 5px;
  color: #333;
}

.actions li:last-child::after {
  content: '';
}

.album-container {
    display: flex;
    padding: 0px;
    overflow-y: auto;
}

.album-container-full {
    margin: 0px;
    padding-right: 30px !important;
    padding-top: 60px !important;
    padding-left: 30px !important;
}

.album-container.left-info {
    justify-content: space-between;
    padding: 0px;
    margin: 15px 0px 0px 0px;
}

.column {
    padding: 0px;
}

.column.right {
    flex-grow: 100;
}

.column.left {
    width: 300px;
    margin-right: 30px;
    margin-top: 2px;
    padding: 0px;
}

.column.left-small {
    width: 150px !important;
}

.left-info {
    font-size: 13px;
} 

.artwork-image:hover .play-button {
  display: block;
}

.artwork-image {
    position: relative;
}

.play-button {
  background-color: rgba(255, 255, 255, .8);
  border: none;
  border-radius: 50%;
  color: #2e8af7;

  font-size: 35px;
  height: 70px;
  width: 70px;
  line-height: 32px;
  outline: none;
  padding-left: 13px;
  position: absolute;
  z-index: 100;
  top: 115px;
  left: 115px;
  
  display: none;
  
  padding-top: 1px;
  padding-bottom: 1px;
}

.play-button-small {
    width: 30px !important;
    height: 30px !important;
    font-size: 15px;
    padding-left: 10px;
    top: 110px;
    left: 10px;
}

.seperator {
    height: 1px;
    width: 100%;
    background-color: #ddd;
}

.album-description {
    margin-top: 20px;
    font-size: 0.875rem;
}

.info {
    margin-top: 4px;
}

h1 {
    font-size: 22px !important;
    font-weight: bold !important;
    margin-bottom: 2px !important;
}

.artist-name {
    font-size: 15px !important;
}

.extra-info {
    font-size: 14px;
    margin-top: 6px;
}

.album-songs:after {
    content: "";
    height: 60px;
    display: block;
}

@media only screen and (max-width: 1300px) {
    img {
      width: 270px;
      height: 270px;
      border-radius: 8px;
  }
  .column.left {
      width: 270px;
  }
  
  .play-button {
    top: 100px;
    left: 100px;
  }
}
@media only screen and (max-width: 1150px) {
    img {
      width: 240px;
      height: 240px;
      border-radius: 7px;
  }
  .column.left {
      width: 240px;
  }
  .play-button {
    top: 95px;
    left: 92px;
  }
}
@media only screen and (max-width: 900px) {
    img {
      width: 210px;
      height: 210px;
      border-radius: 6px;
  }
  .column.left {
      width: 210px;
  }
  .play-button {
    top: 75px;
    left: 75px;
  }
}
@media only screen and (max-width: 830px) {
    img {
      width: 180px;
      height: 180px;
      border-radius: 5px;
  }
  .column.left {
      width: 180px;
  }
  .play-button {
    top: 60px;
    left: 60px;
  }
}
@media only screen and (max-width: 600px) {
    img {
      width: 150px;
      height: 150px;
      border-radius: 4px;
  }
  .column.left {
      width: 150px;
  }
  .play-button {
    top: 105px;
    left: 105px;
    
    font-size: 18px;
    height: 35px;
    width: 35px;
    line-height: 18px;
    padding-left: 11px;
 }
}
</style>
