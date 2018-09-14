
<template>
    <b-container fluid>
      <b-row>
        <b-col cols="2" class="sidebar column">
          <Sidebar class="column" :class="{ 'd-none': false, 'd-sm-none': false, 'd-md-none': false, 'd-lg-block': true, 'd-xl-block': true }" />
        </b-col>
        <b-col cols="10" class="column">
          <router-view></router-view>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';

export default {
  name: 'Me',
    components: {
        Sidebar,
    }
};

// Need s view router to route here correctly!
</script>

<style scoped lang="scss">

.sidebar {
    margin-left: 0px !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
}
    
.column {
    overflow: hidden;
    overflow-y: scroll;   
}
  
</style>