
<template>
  <div>
      <b-list-group class="mb-2">
          <b-list-group-item
            v-for="artist in artists"
            v-bind:key="artist.id"
            href="#"
            :to="{ name: artist.type, params: { id: artist.id } }">
            <span class="title">{{ artist.attributes.name }}</span>
          </b-list-group-item>
      </b-list-group>
      <div class="column-spacer"></div>
  </div>
</template>

<script>
export default {
  name: 'Artists',
  props: {
    title: String,
    artists: Array
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      fields: [ ]
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.grid .item {
  width: 200px;
  margin: 5px;
  font-size: 0.9em;
}

#count {
    margin: 0 auto;
    text-align: center;
}

a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    padding: 8px 5px 8px 15px !important;
}

.list-group-item.active {
    background-color: rgba(150,150,150,.2) !important;
    color: #fa3c5b !important;
}
.column-spacer {
    height: 60px;
}
</style>
