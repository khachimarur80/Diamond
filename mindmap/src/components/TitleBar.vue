<template>
    <div style="display: flex; width: 100h;" id="title-bar">
        <div class="title-bar" id="sidebar-title-bar">
            <v-btn class="toggle-sidebar-left" small icon dense @click="toggleSidebar">
                <v-icon size="20" color="secondary">
                    mdi-newspaper-variant-outline
                </v-icon>
            </v-btn>
        </div>
        <div class="title-bar" id="body-title-bar">
            <div id="tabs">
                <div v-for="tab in files" class="tab" @click="setFile(tab)" :class="{ currentTab: file == tab[0] }" :key="tab[0]">	
                    <div class="tab-smoother-left" v-if="file == tab[0]">
                        <div></div>
                    </div>
                    <div class="tab-inner">
                        <span class="tab-text">{{ tab[1] }}</span>
                        <v-btn dense icon x-small @click="removeFile(tab)" :color="file == tab[0] ? 'white' : 'secondary'" class="tab-btn">
                            <v-icon small>mdi-close</v-icon>
                        </v-btn>
                    </div>
                    <div class="tab-smoother-right" v-if="file == tab[0]">
                        <div></div>
                    </div>
                </div>
                <div class="create-tab-btn">
                    <v-btn dense icon x-small color="#ccc" style="margin-bottom: -3px; -webkit-app-region: no-drag;" @click="createTab">
                        <v-icon size="20">
                            mdi-plus
                        </v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
        <div class="title-bar" id="queries-title-bar" >
            <v-btn class="toggle-sidebar-right" small icon dense  @click="toggleQueries">
                <v-icon size="20" color="secondary">
                    mdi-newspaper-variant-outline
                </v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
  import EventBus from '../event-bus.js';

  export default {
    name: 'TitleBar',
    
    props: {
      files: {
        type: Array,
        required: true,
      },
      file: {
        type: String,
        required: true,
      },
      currentGroup: {
        type: null,
        required: true,
      }
    },
    
    data: () => ({
    }),
  
    methods: {
        //Logic is handled in Main.vue
        createTab() {
            EventBus.$emit('createTab')
        },
        toggleSidebar() {
            EventBus.$emit('toggleSidebar')
        },
        toggleQueries() {
            EventBus.$emit('toggleQueries')
        },
        removeFile(file) {
            EventBus.$emit('removeFile', file)
        },
        setFile(file) {
            EventBus.$emit('setFile', file)
        },
    },
  
    async created() {
    }
  };
</script>