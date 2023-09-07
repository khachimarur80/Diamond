<template>
    <div style="display: flex; width: 100h;" id="title-bar">
        <div class="title-bar" id="sidebar-title-bar">
            <div class="default-buttons">
                <button id="close" @click="closeWindow">
                    <v-icon size="10px" color="black" class="default-button-icon">
                        mdi-close
                    </v-icon>
                </button>
                <button id="minimize" @click="minimizeWindow">
                    <v-icon size="10px" color="black" class="default-button-icon">
                        mdi-minus
                    </v-icon>
                </button>
                <button id="expand" @click="expandWindow">
                    <v-icon size="10px" color="black" class="default-button-icon" style="transform: rotate(-45deg);">
                        mdi-unfold-more-horizontal
                    </v-icon>
                </button>
            </div>
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
                    <v-btn dense icon x-small color="secondary" style="margin-bottom: -3px; -webkit-app-region: no-drag;" @click="createTab">
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
        createTab() {

        },
        toggleSidebar() {
            this.sidebar.flag = !this.sidebar.flag
            const sidebar = document.getElementById('sidebar');
            const sidebarResize = document.getElementById('resizeBarLeft');

            if (this.sidebar.flag) {
                sidebar.style.display = 'block'
                sidebar.style.marginLeft = '0px';
                sidebar.firstElementChild.style.flexDirection = "row";
                document.getElementById('sidebar-title-bar').style.width = this.sidebar.width + 'px'
                setTimeout(()=>{
                    document.getElementById('sidebar-title-bar').style.transition = ""
                    sidebarResize.style.display = 'block'
                }, 200)
            }
            else {
                sidebar.style.marginLeft= '-' + (sidebar.getBoundingClientRect().width - 40) + 'px';
                sidebar.firstElementChild.style.flexDirection = "row-reverse";
                sidebarResize.style.display = 'none'
                document.getElementById('sidebar-menu').marginRight = '0px'
                document.getElementById('sidebar-title-bar').style.transition = 'width .15s'
                document.getElementById('sidebar-title-bar').style.width = "120px"
            }
        },
        toggleQueries() {
            this.queries.flag = !this.queries.flag
            const queries = document.getElementById('queries');
            const queriesResize = document.getElementById('resizeBarRight');

            if (this.queries.flag) {
                queries.style.display = 'block'
                queries.style.marginRight = '0px';
                queriesResize.style.display = 'block'
                setTimeout(()=>{
                    document.getElementById('queries-title-bar').style.transition = ''
                }, 200)
            }
            else {
                document.getElementById('queries-title-bar').style.width = '40px'
                document.getElementById('queries-title-bar').style.transition = 'width .15s'
                queries.style.marginRight = '-' + (queries.getBoundingClientRect().width ) + 'px';
                queriesResize.style.display = 'none'
            }
        },
        removeFile() {

        },
        setFile() {

        },
        closeWindow() {

        },
        minimizeWindow() {

        },
        expandWindow() {

        },
    },
  
    async created() {
    }
  };
</script>