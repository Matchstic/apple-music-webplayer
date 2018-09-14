
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    
    <b-button-group class="w-100">
      <b-button v-if="isAuthorized"
                variant="outline-primary"
                class="w-50"
                v-on:click.prevent="unauthorize()">Sign out</b-button>
      <b-button v-if="!isAuthorized"
                variant="primary"
                class="w-50"
                v-on:click.prevent="authorize()">Sign in</b-button>
    </b-button-group>

    <b-form-group label="Theme">
      <b-form-select v-model="theme" :options="themes" />
    </b-form-group>

    <b-form-group label="Playback">
      <b-form-checkbox v-model="showPlaybackNotifications">Show notifications when the song changes</b-form-checkbox>
      <b-form-checkbox v-model="queueAllSongs">Queue all songs in the current view when double clicking on a song</b-form-checkbox>
    </b-form-group>
    
    <p class="text-muted">Settings are stored in your local browser and will not persist across browsers and/or devices.</p>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'Settings',
  props: {
    title: String
  },
  watch: {
    theme () {
      this.$localStorage.set('theme', this.theme);
      EventBus.$emit('theme');
    },
    showPlaybackNotifications () {
      this.$localStorage.set('showPlaybackNotifications', this.showPlaybackNotifications);
    },
    queueAllSongs () {
      this.$localStorage.set('queueAllSongs', this.queueAllSongs);
    }
  },
  data () {
      let musicKit = window.MusicKit.getInstance();
      
    return {
      isAuthorized: musicKit.isAuthorized,
      musicKit: musicKit,
      theme: this.$localStorage.get('theme'),
      showPlaybackNotifications: this.$localStorage.get('showPlaybackNotifications'),
      queueAllSongs: this.$localStorage.get('queueAllSongs'),
      themes: {
        'light': 'Light',
        'dark': 'Dark'
      }
    };
  },  
  methods: {
      authorize: function () {
        this.musicKit.authorize();
      },
      unauthorize: function () {
        this.musicKit.unauthorize();
      },
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
  },
  destroyed: function () {
    this.abort = true;
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>
