
<template>
  <div>
    <!-- Search -->
    <!--<h2 class="text-uppercase text-muted heading">Search</h2>
    <b-form v-on:submit.prevent="search()">
      <b-form-radio-group v-model="searchParams.library"
                          v-on:input="searchScopeChange()"
                          buttons button-variant="outline-primary"
                          class="mb-1 btn-group-sm split w-100"
                          v-if="isAuthorized">
        <b-form-radio :value="false">Apple Music</b-form-radio>
        <b-form-radio :value="true">Library</b-form-radio>
      </b-form-radio-group>

      <b-form-input id="q"
                    ref="searchInput"
                    type="text"
                    v-model="searchParams.query"
                    placeholder="Search" />

      <b-button type="submit" class="d-none">Search</b-button>
    </b-form>-->

    <!-- Library -->
    <div v-if="isAuthorized">
      <b-list-group class="mb-2">
        <b-list-group-item :to="{ name: 'recently-added' }" exact><i class="far fa-clock tab-icon" />Recent</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-artists' }"><i class="fas fa-microphone-alt tab-icon" />Artists</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-albums' }"><i class="fas fa-compact-disc tab-icon" />Albums</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-songs' }"><i class="fas fa-music tab-icon" />Songs</b-list-group-item>
      </b-list-group>

      <h3 class="text-uppercase text-muted heading">
        Playlists
        <a href="#" v-on:click.prevent="fetch()" class="pull-right">
          <i :class="{ fas: true, 'fa-sync-alt': true, 'fa-spin': loading }" />
        </a>
      </h3>
      <Playlists :playlists="playlists" />
      
      <div class="column-spacer"></div>
    </div>
  </div>
</template>

<script>
import Raven from 'raven-js';
import Playlists from './Playlists.vue';

export default {
  name: 'Sidebar',
  components: {
    Playlists
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      isAuthorized: musicKit.isAuthorized,
      musicKit: musicKit,
      searchParams: {
        query: this.$route.query.q || '',
        library: this.$route.meta.isLibrary || false
      },
      playlists: null
    };
  },
  methods: {
    searchScopeChange: function () {
      this.$refs.searchInput.focus();
      if (this.searchParams.query) {
        this.search();
      }
    },
    search: function () {
      this.$router.push({
        name: this.searchParams.library ? 'library-search' : 'search',
        query: {
          q: this.searchParams.query
        }
      });
    },
    fetch: function (offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
        this.playlists = null;
      }

      this.musicKit.api.library.playlists(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.playlists) {
            this.playlists = r;
          } else {
            this.playlists = this.playlists.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
        }, err => {
          Raven.captureException(err);
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

      if (!this.isAuthorized) {
        this.search.library = false;
      } else {
        this.fetch();
      }
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);

    if (this.isAuthorized) {
      this.fetch();
    }
  },
  destroyed: function () {
    this.abort = true;
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
.heading {
  font-weight: normal;
  padding-top: 10px;
}

h3.heading {
  font-size: 11px;
  padding-left: 15px;
}

.text-sm {
  font-size: 0.9em;
}

.list-group-item {
    background-color: transparent !important;
    color: #888 !important;
    border: 0px !important;
    border-radius: 0px !important;
    font-size: 13px;
    padding: 8px 0px 8px 5px !important;
}

.list-group-item.active {
    background-color: rgba(150,150,150,.2) !important;
    color: #fa3c5b !important;
}

.tab-icon {
    padding: 0px 15px 0px 10px;
}

.fas.tab-icon, .far.tab-icon {
    width: 38px;
    height: 13px;
    text-align: center;
}

.split {
  display: flex;
}

.split label {
  width: 100%;
}

.pull-right {
    float: right;
}
.column-spacer {
    height: 60px;
}
</style>
