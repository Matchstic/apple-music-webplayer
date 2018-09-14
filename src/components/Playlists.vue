
<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="item in playlists"
        v-bind:key="item.id"
        href="#"
        :to="{ name: item.type, params: { id: item.id } }"
        exact>
        <span class="title">{{ item.attributes.name }}</span>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'Playlists',
  props: {
    playlists: Array
  }
};
</script>

<style scoped>
    .list-group-item {
        background-color: transparent !important;
        color: #888 !important;
        border: 0px !important;
        border-radius: 0px !important;
        font-size: 13px;
        padding: 8px 0px 8px 5px !important;
        padding-left: 15px !important;
    }

    .list-group-item.active {
        background-color: rgba(150,150,150,.2) !important;
        color: #fa3c5b !important;
    }
    
    a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>