
<template>
    <div class="library-container">
        <div id="library-loading" v-if="!libraryManager">
          <Loading message="Building library..." />
        </div>
        <Sidebar v-if="libraryManager" class="column left" />
        <router-view v-if="libraryManager" class="column right"></router-view>
    </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'Me',
    components: {
        Sidebar,
        Loading
    },
    data: function () {
        return {
            libraryManager: null
        };  
    },
    created: function () {
        var self = this;
        window.libraryManager.refreshLibrary(window.MusicKit.getInstance(), function (percentComplete) {
            console.log(percentComplete);
        }, function (success) {
            if (success) {
                self.libraryManager = window.libraryManager; // Hides the loading indicator
            }
        });
    }
};

// Need s view router to route here correctly!
</script>

<style scoped lang="scss">

.library-container {
    display: flex;
    padding: 0px;
    width: 100%;
    min-height: 100%;
}
    
.column {
    overflow: auto;
    overflow-y: scroll;  
    max-height: 100vh;
}

.column.left {
    width: 15%;
    padding-top: 60px;
    padding-right: 10px;
}

.column.right {
    width: 85%;
    background-color: #fff;
} 

.dark .column.right {
    background-color: #111;
}

#library-loading {
    width: 100%;
    min-height: 100%;
    position: relative;
    top: 0;
    left: 0;
}
</style>