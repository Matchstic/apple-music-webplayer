<template>
  <div class="navigation container-fluid" v-bind:class="active" v-on:click.prevent>
      <div class="background"></div>
      <div class="navigation-items">
      </div>
      <div class="navigation-items">
          <b-button :variant="primary" :type="button" v-bind:to="{ name: 'library' }">Library</b-button>
          <b-button :variant="primary" :type="button" v-bind:to="{ name: 'recommendations' }">For You</b-button>
      </div>
      <div class="navigation-items">
          <b-button :to="{ name: 'settings' }" variant="primary-fade"><i class="fas fa-cog" /></b-button>
      </div>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
  data: function () {
      let musicKit = window.MusicKit.getInstance();

      return {
        isAuthorized: musicKit.isAuthorized,
        musicKit: musicKit,
        searchParams: {
          query: this.$route.query.q || '',
          library: this.$route.meta.isLibrary || false
        },
      };
  }
};
</script>

<style scoped lang="scss">
.navigation {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  height: 40px;
  font-size: 0.9em;
  padding: 0px;
  margin: 0;

  border-bottom: 1.5px solid rgba(0, 0, 0, .2);
  background-color: rgba(210, 210, 210, 0.6);

  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.dark .navigation {
    background-color: rgba(50, 50, 50, 0.6);
}

.navigation-buttons {
    width: 50px;
    height: 100%;
    
    padding: 6px 15px !important;
    margin: 0px 5px;
}

.navigation-items {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: center;
}

.btn {
    display:inline-block;

    padding: 6px 15px !important;
    margin: 0px 5px;
    color: #888 !important;
    background-color:transparent !important;
    font-size:12px !important;
    border: 0px !important;
    text-decoration:none !important;
    line-height:1;

    -webkit-transition:background-color 0.25s;
    -moz-transition:background-color 0.25s;
    transition:background-color 0.25s;
}

.dark .btn.active {
    background-color:rgba(61,90,124,.6) !important;
    color: white !important;
}

.btn.active {
    background-color:rgba(250,60,91,.2) !important;
    color: #fa3c5b !important;
    border: 0px !important;
}

.btn-group .btn {
    background-color:rgba(250,60,91,.2) !important;
    color: #fa3c5b !important;
    border-radius: 3px !important;
}

.background {
  position: fixed;
  left: 0;
  right: 0;
  z-index: -1;
  width: 100%;
  height: 40px;

  -webkit-backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
}
</style>
