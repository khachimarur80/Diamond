<template>
    <v-app>
      <div id="app-container">
        <TitleBar :files="files" :file="file" :currentGroup="currentGroup"></TitleBar>
        <div id="app-contents">
        </div>
      </div>
    </v-app>
</template>
    
<script>
  class Group {
    constructor() {
      this.id = Math.floor(Math.random()*100000)
      this.name = Math.floor(Math.random()*100000).toString()
      this.words = []
      this.connections = []
      this.groups = []
      this.x = 0
      this.y = 0
      this.width = 0
      this.height = 0
      this.objectType = "Group"
      this.file = ""
      this.categories = []
    }
  }

  import TitleBar from './components/TitleBar';

  export default {
    name: 'MainWin',
  
    components: {
      TitleBar
    },
    
  
    data: () => ({
      currentGroup: null,
      selectedObject: [],
      files: [],
      file: null,
      queryTarget: null,
      activeItem: null,
      openedNodes: [],
    }),

    methods: {
    },
  
  mounted() {
    const sidebar = document.getElementById('sidebar');
    const sidebarTitleBar = document.getElementById('sidebar-title-bar');
    const queries = document.getElementById('queries');
    const queriesTitleBar = document.getElementById('queries-title-bar');

    const updateWidth = () => {
      if (this.sidebar.flag) {
        sidebarTitleBar.style.width = sidebar.getBoundingClientRect().width + 'px';
      }
      if (this.queries.flag) {
        queriesTitleBar.style.width = queries.getBoundingClientRect().width + 'px';
      }
      requestAnimationFrame(updateWidth)
    };
    updateWidth()
  },
  async created() {
    /*eventBus.$on('fileopened', this.openFile);
    eventBus.$on('filemove', this.moveFile);
    eventBus.$on('nodeMouseDown', this.nodeMouseDown)
    eventBus.$on('saveFileNode', this.saveFileNode)*/

    const vaultMessage = await new Promise(resolve => {
      window.electronAPI.response("vault-name-response", vaultName => {
        resolve(vaultName);
      });
    });

    this.vault = vaultMessage

    const message = await new Promise(resolve => {
      window.electronAPI.requestLoadData(this.vault+'/'+this.vault.split('/')[this.vault.split('/').length-1]+'.json')
      window.electronAPI.response("load-data-response", resolve)
    })

    const data = JSON.parse(message)

    if (!data.currentGroup || Array.isArray(data.currentGroup)) {

      var newGroup = new Group()
      newGroup.name = this.vault.split('/').splice(-1)[0]
      newGroup.file = this.vault+'/'+newGroup.name+'.md'

      this.currentGroup = newGroup
      this.selectedObject = newGroup

      const data = JSON.parse(message)

      this.activeItem = data.activeItem
      this.file = data.file
      this.openedNodes = data.opened
      this.queryTarget = data.queryTarget}
    else {

      this.currentGroup = data.currentGroup
      this.selectedObject = data.selectedObject
      this.activeItem = data.activeItem
      this.file = data.file
      this.openedNodes = data.opened

      this.queryTarget = data.queryTarget}

    if (this.file) {
      this.files = [[this.file, this.file.split('/')[this.file.split('/').length-1]]]}
    else {
      this.files = []}

    this.updateTreeDataview()
  },
  };
</script>
    
<style>
  body, html {
    margin: 0px;
    height: 100%;
    width: 100%;
    padding: 0px;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  #app-container {
    height: 100vh;
    width: 100h;
  }
  #app-contents {
    display: flex;
    height: 100%;
    width: 100%;
  }
</style>