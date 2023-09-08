<template>
    <v-app v-cloak>
    <div id="app-container" v-if="currentGroup">
        <TitleBar :files="files" :file="file" :currentGroup="currentGroup"></TitleBar>
        <div id="app-contents">
        <SideBar :items="treeDataView" :vault="vault" @createFile="createFile"></SideBar>
        <div id="body">
            <TextEditor :file="file"></TextEditor>
            <QueryView></QueryView>
        </div>
        <QueryBar :currentGroup="currentGroup"></QueryBar>
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


import SideBar from './components/SideBar';
import QueryBar from './components/QueryBar';
import TitleBar from './components/TitleBar';
import TextEditor from './components/TextEditor';
import QueryView from './components/QueryView';

import EventBus from './event-bus.js';

export default {
    name: 'MainWin',

    components: {
    SideBar,
    QueryBar,
    TitleBar,
    TextEditor,
    QueryView,
    },
    

    data: () => ({
        treeDataView: [],
        currentGroup: null,
        selectedObject: [],
        files: [],
        file: '',
        activeItem: null,
        openedNodes: [],
        sidebar: {
            flag: true,
        },
        queries: {
            flag: true,
        },
        vault: '',
        navigated: [],
    }),

    methods: {
        getWordById(id) {
            for(let i=0; i<this.currentGroup.words.length; i++) {
                if (this.currentGroup.words[i].id==id) {
                    return this.currentGroup.words[i]
                }
            }
        },
        getCategoryById(id) {
            for(let i=0; i<this.currentGroup.categories.length; i++) {
                if (this.currentGroup.categories[i].id==id) {
                    return this.currentGroup.categories[i]
                }
            }
        },
        getConnectionById(id) {
            for(let i=0; i<this.currentGroup.connections.length; i++) {
                if (this.currentGroup.connections[i].id==id) {
                    return this.currentGroup.connections[i]
                }
            }
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
        get_open(nodes) {
            let opened_nodes = []
            for (const node of nodes) {
            if (node.open) {
                opened_nodes.push(node.id)
            }
            if (node.children && node.children.length) {
                this.get_open(node.children);
            }
            }
            return opened_nodes
        },
        set_open(nodes, opened) {
            for (const node of nodes) {
            if (opened.includes(node.id)) {
                node.open = true
            }
            }
        },
        async updateTreeDataview() {
            let message = await new Promise(resolve => {
            window.electronAPI.requestTreeData(this.vault)
            window.electronAPI.response("tree-data-response", resolve)
            })
            if (this.treeDataView.length) {
            let oldTreeView = this.treeDataView
            let opened_nodes = []
            this.treeDataView = message

            opened_nodes = this.get_open(oldTreeView)
            this.set_open(this.treeDataView, opened_nodes)
            }
            else {
            this.treeDataView = message

            if (this.openedNodes) {
                this.set_open(this.treeDataView, this.openedNodes)
            }
            }
        },
        createFile(message) {
            this.file = message
            this.files.push([this.file, this.file.split('/')[this.file.split('/').length-1]])
            this.files = [...new Set(this.files)];
            this.updateTreeDataview()
        },
        createFolder() {
            if (this.file) {
                window.electronAPI.createFolder(this.file)
                this.updateTreeDataview()
            }
            else {
                window.electronAPI.createFolder(this.currentGroup.file)
                this.updateTreeDataview()
            }
        },
        toggleTreeview(flag) {
            const opened = flag
            function closeAllNodes(treeData) {
                function closeNodesRecursively(node) {
                    node.open = opened;
                    for (const childNode of node.children) {
                    closeNodesRecursively(childNode);
                    }
                }

                for (const node of treeData) {
                    closeNodesRecursively(node);
                }
            }
            closeAllNodes(this.treeDataView);
        },
        openFile(file) {
            if (typeof file === "string") {
                this.file = file
            }
            else {
                this.file = this.selectedObject.file
            }

            let addFile = true
            this.files.forEach((file) => {
                if (this.file == file[0]) {
                    addFile = false
                }
            })

            if (addFile) {
                this.files.push([this.file, this.file.split('/')[this.file.split('/').length-1]])
                this.files = [...new Set(this.files)];
            }
        },
        removeFile(file) {
            for (let i=0; i<this.files.length; i++) {
                if (this.files[i]==file) {
                    if (file[0]==this.file) {
                        this.file = ''
                    }
                    this.files.splice(i, 1)
                }
            }
        },
        setFile(file) {
            this.file = file[0]
        },
        moveFile(origin, destiny) {
            window.electronAPI.moveFileRequest(origin, destiny)
            setTimeout(()=>{this.updateTreeDataview()}, 100)
        },
        saveFileNode(node, new_name) {
            var short_name = new_name.split('/').splice(-1)[0].split('.').slice(0,-1).join(".")
            if (this.file==node.id) {
                this.file = new_name
            }
            for (let i=0; i<this.files.length; i++) {
                if (this.files[i][0]==node.id) {
                    this.files[i] = [new_name, short_name]
                }
            }
        },
        openNode(node) {
            node.open = !node.open
        },
        removeNodeFile(target) {
            window.electronAPI.requestFileDeletion(target.id)
                
            if (this.file == target.id) {
                this.file = ''	
            }
            this.files = this.files.filter(file => file[0]!=target.id)

            function removeNodeFromTree(tree, nodeId) {
                for (let i = 0; i < tree.length; i++) {
                    const node = tree[i];

                    if (node.id === nodeId) {
                    tree.splice(i, 1);
                    return true;
                    }

                    if (node.children) {
                    if (removeNodeFromTree(node.children, nodeId)) {
                        return true;
                    }
                    }
                }

                return false;
            }
            removeNodeFromTree(this.treeDataView, target.id)
        },
        async createTab() {
            if (this.file) {
                const message = await new Promise(resolve => {
                    window.electronAPI.createFile(this.file)
                    window.electronAPI.response('create-file-response', resolve)
                });
                this.file = message
                this.files.push([this.file, this.file.split('/')[this.file.split('/').length-1]])
                this.files = [...new Set(this.files)];
                this.updateTreeDataview()
            }
            else {
                const message = await new Promise(resolve => {
                    window.electronAPI.createFile(this.vault)
                    window.electronAPI.response('create-file-response', resolve)
                });
                this.file = message
                this.files.push([this.file, this.file.split('/')[this.file.split('/').length-1]])
                this.files = [...new Set(this.files)];
                this.updateTreeDataview()
            }
        },
        saveMetaData() {
            const jsonData = {
                currentGroup: this.currentGroup,
                selectedObject: this.selectedObject,
                file: this.file,
                opened: this.openedNodes,
            };

            const jsonString = JSON.stringify(jsonData)

            window.electronAPI.requestSaveData(jsonString, this.vault+'/'+this.vault.split('/')[this.vault.split('/').length-1]+'.json')

        },
        saveContents() {
			/*if (this.file) {
				var textContent = []
				var lines = document.querySelectorAll('.line')
				for (let i=0; i<lines.length; i++) {
					textContent.push(lines[i].getAttribute('data-text')
						//.replace('&nbsp;&nbsp;&nbsp;&nbsp;', '\t')
						.replace(/\n$/, '')
					)
				}
				window.electronAPI.requestSaveFile(this.file, textContent.join('\n'))
			}*/
		},
        async loadContents() {
            /*
            document.getElementById('text').innerHTML = ''
            this.textViewMode = 'edit'
            const message = await new Promise(resolve => {
                window.electronAPI.requestFileData(this.file)
                window.electronAPI.response("file-data-response", resolve)
            })
            if (typeof message != 'string') {
                this.files = this.files.filter(file => file[0]!=this.file)
            }
            else {
                for (let i=0; i<message.split('\n').length; i++) {
                    var newLine = this.createLine(message.split('\n')[i])
                    this.renderMarkdown(newLine)
                    document.getElementById('text').appendChild(newLine)
                }
                document.documentElement.style.setProperty('--line-count', document.querySelectorAll('.line').length.toString().length);
            }
            */
        },
        pushObjectToCurrentGroup(object, queryTarget) {
            if (queryTarget===0) {
                this.currentGroup.words.push(object)
            }
            if (queryTarget===1) {
                this.currentGroup.connections.push(object)
            }
            if (queryTarget===2) {
                this.currentGroup.categories.push(object)
            }
        },
        deleteObject() {
            if (this.selectedObject.objectType == 'Word') {
                this.currentGroup.words.splice(this.currentGroup.words.indexOf(this.selectedObject), 1)
                window.electronAPI.requestFileDeletion(this.selectedObject.file)

                for (let i=0; i<this.selectedObject.categories.length;i++) {
                    var category = this.getCategoryById(this.selectedObject.categories[i])
                    category.words = category.words.filter(word => word!=this.selectedObject.id)
                }
                for (let i=0; i<this.selectedObject.connections.length;i++) {
                    var connection = this.getConnectionById(this.selectedObject.connections[i][0])
                    var word = this.getWordById(this.selectedObject.connections[i][1])

                    connection.words = connection.words.filter(word => !word.includes(this.selectedObject.id))
                    word.connections = word.connections.filter(connection => !connection.includes(this.selectedObject.id)) 
                }
                if (this.file==this.selectedObject.file) {
                    this.files = this.files.filter(file => file[0]!=this.file)
                    this.file = ''
                }
                if (this.fileQuery==this.selectedObject) {
                    this.fileQuery = []
                }
            }
            if (this.selectedObject.objectType == 'Connection') {
                this.currentGroup.connections.splice(this.currentGroup.connections.indexOf(this.selectedObject), 1)
                window.electronAPI.requestFileDeletion(this.selectedObject.file)

                for (let i=0; i<this.selectedObject.categories.length;i++) {
                    let category = this.getCategoryById(this.selectedObject.categories[i])
                    category.connections = category.connectionsObj.filter(connection => connection!=this.selectedObject.id)
                }
                for (let i=0; i<this.selectedObject.words.length;i++) {
                    var word1 = this.getWordById(this.selectedObject.words[i][0])
                    var word2 = this.getWordById(this.selectedObject.words[i][1])

                    word1.connections = word1.connections.filter(connection => !connection.includes(this.selectedObject.id))
                    word2.connections = word2.connections.filter(connection => !connection.includes(this.selectedObject.id)) 
                }
                if (this.file==this.selectedObject.file) {
                    this.files = this.files.filter(file => file[0]!=this.file)
                    this.file = ''
                }
                if (this.fileQuery==this.selectedObject) {
                    this.fileQuery = []
                }
            }
            if (this.selectedObject.objectType == 'Category') {
                this.currentGroup.categories.splice(this.currentGroup.categories.indexOf(this.selectedObject), 1)
                window.electronAPI.requestFileDeletion(this.selectedObject.file)

                for (let i=0; i<this.selectedObject.words.length;i++) {
                    let word = this.getWordById(this.selectedObject.words[i])
                    word.categories = word.categories.filter(category => category!=this.selectedObject.id)
                }
                for (let i=0; i<this.selectedObject.connectionsObj.length;i++) {
                    let connection = this.getConnectionById(this.selectedObject.connections[i])
                    connection.categories = connection.categories.filter(category => category!=this.selectedObject.id)
                }
                if (this.file==this.selectedObject.file) {
                    this.files = this.files.filter(file => file[0]!=this.file)
                    this.file = ''
                }
                if (this.fileQuery==this.selectedObject) {
                    this.fileQuery = []
                }
            }
            this.selectedObject = []
            setTimeout(()=>{this.updateTreeDataview()}, 50)
        },
        setSelectedObject(object) {
            this.selectedObject = object
        },
        async saveWordName(value) {
            var wordTarget = this.getWordById(this.selectedObject.id)

            document.querySelectorAll('.word').forEach(e => {
                if (e.innerText == wordTarget.name) {
                    e.innerText = value
                }
            })

            if (document.getElementById(this.selectedObject.id)) {
                document.getElementById(this.selectedObject.id).textContent = value
            }

            wordTarget.name = value

            const message = await new Promise(resolve => {
                window.electronAPI.requestChangeFileName(wordTarget.file, value)
                window.electronAPI.response('change-filename-response', resolve)
            })

            if (wordTarget.file==this.file) {
                this.file = message
            }
            this.files = this.files.map(tab => {
            if (tab.includes(wordTarget.file)) {
                return [this.file, this.file.split('/')[this.file.split('/').length-1]]
            }
            return tab; 
            });


            wordTarget.file = message

            this.saveContents()
            this.updateTreeDataview()
        },
        async saveConnectionName(value) {
            var connectionTarget = this.getConnectionById(this.selectedObject.id)

            document.querySelectorAll('.connection').forEach(e => {
                if (e.innerText == connectionTarget.name) {
                    e.innerText = value
                }
            })

            if (document.getElementById(this.selectedObject.id)) {
                document.getElementById(this.selectedObject.id).textContent = value
            }

            connectionTarget.name = value

            const message = await new Promise(resolve => {
                window.electronAPI.requestChangeFileName(connectionTarget.file, value)
                window.electronAPI.response('change-filename-response', resolve)
            })

            if (connectionTarget.file==this.file) {
                this.file = message
            }
            this.files = this.files.map(tab => {
            if (tab.includes(connectionTarget.file)) {
                return [this.file, this.file.split('/')[this.file.split('/').length-1]]
            }
            return tab; 
            });

            connectionTarget.file = message

            this.saveContents()
            this.updateTreeDataview()
        },
        async saveCategoryName(value) {
            var categoryTarget = this.getCategoryById(this.selectedObject.id)

            categoryTarget.name = value

            const message = await new Promise(resolve => {
                window.electronAPI.requestChangeFileName(categoryTarget.file, value)
                window.electronAPI.response('change-filename-response', resolve)
            })

            if (categoryTarget.file==this.file) {
                this.file = message
            }
            this.files = this.files.map(tab => {
            if (tab.includes(categoryTarget.file)) {
                return [this.file, this.file.split('/')[this.file.split('/').length-1]]
            }
            return tab; 
            });

            categoryTarget.file = message

            this.saveContents()
            this.updateTreeDataview()
        },
    },

    mounted() {
        const updateWidth = () => {
            const sidebar = document.getElementById('sidebar');
            const sidebarTitleBar = document.getElementById('sidebar-title-bar');
            const queries = document.getElementById('queries');
            const queriesTitleBar = document.getElementById('queries-title-bar');

            if (this.sidebar.flag && sidebarTitleBar) {
            sidebarTitleBar.style.width = sidebar.getBoundingClientRect().width + 'px';
            }
            if (this.queries.flag && queriesTitleBar) {
            queriesTitleBar.style.width = queries.getBoundingClientRect().width + 'px';
            }
            requestAnimationFrame(updateWidth)
        };
        updateWidth()
    },
    async created() {
        EventBus.$on('openNode', this.openNode);
        EventBus.$on('fileopened', this.openFile);
        EventBus.$on('filemove', this.moveFile);

        EventBus.$on('saveFileNode', this.saveFileNode)
        EventBus.$on('createFile', this.createFile);
        EventBus.$on('createFolder', this.createFolder);
        EventBus.$on('toggleTreeview', this.toggleTreeview);
        EventBus.$on('removeNodeFile', this.removeNodeFile);

        EventBus.$on('toggleSidebar', this.toggleSidebar);
        EventBus.$on('toggleQueries', this.toggleQueries);

        EventBus.$on('removeFile', this.removeFile);
        EventBus.$on('setFile', this.setFile);
        EventBus.$on('createTab', this.createTab);

        EventBus.$on('pushObjectToCurrentGroup', this.pushObjectToCurrentGroup);
        EventBus.$on('selectedObject', this.setSelectedObject)
        EventBus.$on('deleteObject', this.deleteObject)

        EventBus.$on('saveCategoryName', this.saveCategoryName);
        EventBus.$on('saveConnectionName', this.saveConnectionName)
        EventBus.$on('saveWordName', this.saveWordName)
        EventBus.$on('openFile', this.openFile);

        const vaultMessage = await new Promise(resolve => {
            window.electronAPI.requestVaultData('vault-data')
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
    }
    else {

        this.currentGroup = data.currentGroup
        this.selectedObject = data.selectedObject
        this.activeItem = data.activeItem
        this.file = data.file
        this.openedNodes = data.opened
    }

    if (this.file) {
        this.files = [[this.file, this.file.split('/')[this.file.split('/').length-1]]]}
    else {
        this.files = []}
        this.file = ''
        this.updateTreeDataview()
    },
    watch: {
        currentGroup: {
            deep: true,
            handler() {
                this.saveMetaData()
            }
        },
        selectedObject: {
            deep: true,
            handler() {
                if (this.selectedObject) {
                    this.newName = this.selectedObject.name
                    this.saveMetaData();
                }
            }
        },
        file: {
            deep: true,
            handler() {
                if (this.file) {
                    if (!this.navigated) {
                        this.fileHistory.push(this.file)
                    }
                    else {
                        this.navigated = false
                    }
                    this.loadContents()
                    if (this.file.includes('/words/')) {
                        this.fileQuery = this.currentGroup.words.filter((e)=> e.file==this.file)[0]
                    }
                    else if (this.file.includes('/connections/')) {
                        this.fileQuery = this.currentGroup.connections.filter((e)=> e.file==this.file)[0]
                    }
                    else if (this.file.includes('/categories/')) {
                        this.fileQuery = this.currentGroup.categories.filter((e)=> e.file==this.file)[0]
                    }
                    if (!this.fileQuery) {
                        this.fileQuery = []
                    }
                }
                this.saveMetaData();
            }
        },
        treeDataView: {
            deep: true,
            handler() {
                let  opened_nodes = []
                    this.openedNodes = []

                    function get_open(nodes) {
                for (const node of nodes) {
                    if (node.open) {
                    opened_nodes.push(node.id)
                    }
                    if (node.children && node.children.length) {
                    get_open(node.children);
                    }
                }
                }
                get_open(this.treeDataView)
                this.openedNodes = opened_nodes

                this.saveMetaData()
                }
        }
    },
};
</script>

<style>
:root {
--selection-color: rgba(98, 141, 208, .3);
--main-bg: #363636;
}

body, html {
    margin: 0px;
    padding: 0px;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #262626;
}

::-webkit-scrollbar {
    display: none;
}

[v-cloak] {
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
.default-buttons {
    position: absolute;
    left: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    -webkit-app-region: no-drag;
}
.default-buttons button {
    border: none;
    height: 12px;
    width: 12px;
    border-radius: 50%;
}
.default-button-icon {
    display: none !important;
}
.default-buttons:hover .default-button-icon {
    display: block !important;
}
#close {
    background: rgb(255, 95, 87);
}
#minimize {
    background: rgb(254, 188, 46);
}
#expand {
    background: rgb(40, 200, 64);
}
#body-title-bar {
    flex: 1;
    border-bottom: 1px solid #363636;
}
#sidebar-title-bar {
    min-width: 120px !important;
    border-bottom: 1px solid #363636;
}
#queries-title-bar {
    border-bottom: 1px solid #363636;
}

.title-bar {
height: 40px;
color: white;
-webkit-app-region: drag;
display: flex;
justify-content: center;
align-items: center;
position: relative;
background: var(--main-bg);
}
.title-bar:first-child {
    justify-content: flex-end;
}
.title-bar:last-child {
    justify-content: flex-start;
}
.content-wrapper {
    height: calc(100vh - 30px);
    width: 100%;
}
#tabs {
    height: 40px;
    width: 100%;
    display: flex;
    text-align: center;
    color: #777;
    gap: 6px;
    box-sizing: content-box;
    align-items: flex-end;
}
.tab:first-child {
    margin-left: 8px;
}
.tab:last-child {
    margin-right: 8px;
}
.tab {
    display: flex;
    height: 32px;
    justify-content: center;
    align-items: flex-start;
    border-radius: 9px 9px 0px 0px;
    padding-top: 3px;
    padding-left: 3px;
    padding-right: 3px;
    user-select: none;
    gap: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 30px;
    max-width: 200px;
    position: relative;
    transform: translateY(2px);
    border-bottom: 1px solid #1e1e1e;
    -webkit-app-region: no-drag;
    text-overflow: ellipsis;
    flex-shrink: 1;
}
.tab-inner {
    width: 100%;
    height: calc(100% - 8px);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 5px;
}
.tab-inner:hover {
background: #454545;
}
.tab-text {
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    margin-left: 10px;
    margin-right: 20px;
}
.tab-smoother-right {
width: 8px;
height: 20px;
background-color: #1e1e1e;
position: absolute;
right: -8px;
bottom: -1px;
padding-bottom: 2px;
}
.tab-smoother-left {
    width: 8px;
height: 20px;
background-color: #1e1e1e;
position: absolute;
left: -8px;
bottom: -1px;
padding-bottom: 2px;
}

.tab-smoother-left div, .tab-smoother-right div {
    background: var(--main-bg);
    border: 1px solid #363636;
    box-sizing: border-box;
    border-top: none;
    height: 100%;
    width: 100%;
}

.tab-smoother-right div {
    border-radius: 0px 0px 0px 8px;
    border-right: none;
}
.tab-smoother-left div {
    border-radius: 0px 0px 8px 0px;
    border-left: none;
}

.tab-btn {
    position: absolute !important;
    right: 5px;
}
.create-tab-btn {
    display: flex;
    align-items: center;
    height: 100%;
    padding-left: 5px;
    padding-right: 5px;
}
.currentTab, .currentTab .tab-inner {
    color: white;
    background: #1e1e1e !important;
}
.currentTab {
    border-top: 1px solid #363636;
    border-left: 1px solid #363636;
    border-right: 1px solid #363636;
}
#loading-contents {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
}
#open-vault {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}
#open-vault h1 {
    text-align: center;
    padding: 20px;
}

.option {
    width: 80%;
    margin-left: 10%;
    margin-right: 10%;
    display: flex;
}
.option-text {
    flex: 1;
}

#body {
    height: 100%;
    flex: 1;
    overflow: hidden;
    background: #1e1e1e;
    user-select: none;
}

#sidebar {
    height: 100%;
    background: #262626;
    position: relative;
    transition: margin 0.15s ;
    user-select: none;
    width: 245px;
}
#queries {
    height: 100%;
    position: relative;
    transition: margin 0.15s;
    background: #262626;
    width: 245px;
    user-select: none;
}

#sidebar .content-wrapper {
    display: flex;
}
#sidebar-contents {
    flex: 1;
    overflow: hidden;
}
#sidebar-menu {
    min-width: 40px !important;
    height: 100%;
    border-right: 1px solid #363636;
    display: flex;
    flex-direction: column;
    position: relative;
    background: #262626;
    z-index: 2;
}
#sidebar-menu-core {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    flex-direction: column;
    width: 40px;
    bottom: 10px;
    gap: 10px;
    padding-bottom: 10px;
}
#sidebar-toolbar {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
}
#resizeBarLeft {
    cursor: col-resize;
    width: 1px;
    background: #363636;
    height: 100% ;
    position: absolute;
    top: -40px;
    right: 0px;
    z-index: 100;
    transition: background ease-in-out .2s;
}
#resizeBarLeft:hover {
    width: 3px;
    background: #628DD0;
}

#resizeBarRight {
    cursor: col-resize;
    width: 1px;
    background: #363636;
    height: 100%;
    position: absolute;
    top: -40px;
    left: 0px;
    z-index: 100;
    transition: background ease-in-out .2s;
}
#resizeBarRight:hover {
    width: 3px;
    background: #628DD0;
}

#resizeBarMiddle {
    cursor: row-resize;
    width: 100%;
    background: #363636;
    height: 1px;
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 100;
    transition: background ease-in-out .2s;
}
#resizeBarMiddle:hover {
    height: 3px;
    background: #628DD0;
}

#sidebar-btn {
    position: absolute;
    top: 5px;
    left: 8px;
}
.toggle-sidebar-left {
    -webkit-app-region: no-drag;
    margin-top: 2px;
    margin-right: 7px;
}
.toggle-sidebar-right {
    -webkit-app-region: no-drag;
    margin-top: 2px;
    margin-left: 7px;
}
#map-view-mode {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 2;
}
#text-view-mode {
    margin-top: 5px;
    margin-right: 5px;
    z-index: 2;
}
#text-content {
    width: 100%;
    height: 50%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    border-top: 1px solid #1e1e1e;
}
#text-display::-webkit-scrollbar {
    display: none;
}
#text-display {
    height: 100%;
    width: 100%;
    display: flex;
    overflow: scroll;
}

#text {
    color: white;
    outline: none;
    height: 100%;
    resize: none;
    height: fit-content;
    margin: 30px;
    position: relative;
    width: 100%;
    padding: calc(var(--line-count)*5px);
}

::selection {
    background: var(--selection-color);
    cursor: pointer;
}

#text::-webkit-scrollbar {
    display: none;
}
.reading {
    user-select: none;
    pointer-events: none;
}

#result {
    flex: 1;
    width: 100%;
    padding: 10px;
    overflow: auto;
}
#result::-webkit-scrollbar {
    display: none;
}
#runText {
    position: absolute;
    right: 10px;
    bottom: 10px;
}

#queries-content {
    height: 50%;
    width: 100%;
}
#query-selected {
    height: 50%;
    width: 100%;
}

#queries-toolbar {
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    padding-top: 10px;
    height: 70px;
    white-space: nowrap;
overflow: hidden;
}
#words-display {
    border-top: 2px solid #43A047;
}

#connections-display {
    border-top: 2px solid #1976D2;
}

#groups-display {
    border-top: 2px solid #EF5350;
}
.query-display::-webkit-scrollbar {
    display: none;
}
.query-display {
    width: 100%;
    height: calc(100% - 70px);
}

#words-display div, #groups-display div, #connections-display div{
    text-align: center;
    padding: 3px;
    border: inherit;
    border-top: none;
    border-left: none;
    border-right: none;
    user-select: none;
    cursor: pointer;
    min-height: 32px;
}
.query-display-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;;
}
.query-display-contents{
    height: calc(100% - 60px);
    overflow: scroll;
}
.query-display-contents::-webkit-scrollbar {
    display: none;
}

#map-content {
    width: 100%;
    height: calc(50% - 10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}
#map {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
}
#query {
    width: 100%;
    height:  100%;
    position: relative;
}
#query::-webkit-scrollbar {
    display: none;
}

.query-content {
    width: 100%;
    height: 100%;
    overflow: scroll;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 50px;
}

.word {
    text-decoration-color: #43A047;
    text-decoration: underline;
    color: #43A047;
    display: inline-block;
    user-select: none;
}
.connection {
    text-decoration-color: #1976D2;
    text-decoration: underline;
    display: inline-block;
    color: #1976D2;
    user-select: none;
}
#current-group {
    height: 100%;
    width: 100%;
    position: relative;
}

#current-object {
    height: 50%;
    width: 100%;
    padding: 20px;
    position: relative;
}
#backpack {
    height: 50%;
    width: 100%;
}
.close-btn {
    position: absolute !important;
    top: 10px;
    right: 10px;
}

.rectangle {
    background: rgba(125,91,237, .1);
    outline: 1px dotted #628DD0;
    position: absolute;
}

.wordObj {
    width: 60px;
    height: 25px;
    text-overflow: wrap;
    text-align: center;
    user-select: none;
    cursor: pointer;
    position: absolute;
    z-index: 1;
    background: #262626;
    outline: 1px solid #777;
    border-radius: 5px;
    color: #777;
}
.wordObj:active {
    outline-color: white !important;
    color: white !important; 
}

.hovering {
    outline-style: dashed !important;
}

svg {
    z-index: 0;
    pointer-events: none;
}

text {
    pointer-events: initial;
}

#current-group {
    background: transparent;
    overflow: hidden;
}

.container {
    position: absolute;
    outline: 1px solid #777;
    padding: 10px;
    height: fit-content;
    width: fit-content;
    z-index: 2;
}
.container:active {
    outline-color: white; 
}

#map-name {
    position: absolute;
    width: 70px;
    right: calc(50% - 35px);
    top: 10px;
    text-align: center;
    text-transform: uppercase;
    user-select: none;
}

#switch-views {
    position: absolute;
    bottom: 8px;
    right: 10px;
}

#object-data-content {
    padding: 20px;
}

#query-selected h4 {
    text-align: center;
    padding: 5px;
}

table {
border-collapse: collapse;
width: 100%;
}

table, th, td {
border: 1px solid #333;
text-align: center;
vertical-align: middle;
padding: 8px;
}

h1, h2, h3, h4, h5, h6,
p, ul, ol, table {
margin-top: 0.8em;
margin-bottom: 0.8em;
}

pre, code {
margin-top: 0.8em;
margin-bottom: 0.8em;
}

blockquote {
margin: 0.8em 0;
}

hr {
margin: 1.5em 0;
}
.query {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    gap: 10px;
    align-items: center;
}

.query-text-field {
    width: 80%;
    margin-left: 10%;
}
.query-button-group {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 10px;
}
.query-list {
    width: 90%;
    height: fit-content;
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 20px;
}

.query-list::-webkit-scrollbar {
    display: none;
}

.query-list-heading {
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
.query-list-item {
    width: 100%;
    display: flex;
    gap: 5px;
    justify-content: center;
    align-items: center;
    user-select: none;
}
.query-list-row {
    width: 100%;
    display: flex;
    gap: 5px;
    justify-content: center;
    align-items: center;
    user-select: none;
    border-top: 1px solid #333;
    padding: 5px;
}
.query-list-row:last-child {
    border-bottom: 1px solid #333;
}

.query-list-item-column {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.delete-query-list-item {
    opacity: 0;
}
.query-list-item:hover .delete-query-list-item {
    opacity: 1;
}
.query-list-row:hover .delete-query-list-item {
    opacity: 1;
}


.instances {
width: 100%;
}

.instance-container {
    display: flex;
    align-items: center;
    flex-direction: column;
margin-bottom: 20px;
}

.table-container {
width: 90%;
overflow-x: auto;
}

.query-list-table {
width: 100%;
table-layout: fixed;
}

.query-list-table td, .query-list-table th {
text-align: center;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
width: fit-content !important;
}


.autocomplete-container {
max-width: 200px;
}


.connection-link {
transition: color .3s;
transition: text-shadow .5s;
}

.connection-link:hover {
color: var(--v-primary-base);
text-shadow: 0px 0px 2px blue;
}

.word-link {
transition: color .3s;
transition: text-shadow .5s;
}

.word-link:hover {
color: var(--v-success-base);
text-shadow: 0px 0px 2px green;
}

.category-link {
transition: color .3s;
transition: text-shadow .5s;
}

.category-link:hover {
color: var(--v-error-base);
text-shadow: 0px 0px 2px red;
}
.relation-table {
    display: flex;
    justify-content: center;
    overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;
}
.relation-table span {
    width: 50%;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}
#sidebar-history {
    width: fit-content;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
#text-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}
.file-name{
    color: #555;
    font-size: 14px;
}
#autocomplete {
    position: absolute;
    border: 1px solid #333;
    max-width: 250px;
    min-width: 150px;
    display: flex;
    border-radius: 5px;
    background: #262626;
    flex-direction: column;
    overflow: scroll;
    max-height: 300px;
    padding: 5px;
    background: #1c1c1c;
}
#autocomplete::-webkit-scrollbar {
    display: none;
}
.prediction{
    text-overflow: ellipsis;
    margin: 0px;
    padding: 0px;
    user-select: none;
    text-align: center;
    padding: 2px;
    padding-left: 5px;
    padding-right: 5px;
    border-bottom: 1px solid #333;
}
.prediction:last-child {
    border-bottom: none;
}
.selectedPrediction {
    background-color: #333;
}

.prediction:hover {
    background: #333;
}


.line {
    padding: 0px;
    min-height: 24px;
    outline: none;
    display: flex;
    position: relative;
    counter-increment: lineCounter;
    padding-left: 15px;
}

.line-contents {
    width: 100%;
}
.line-count {
height: 20px;
width: fit-content;
display: flex;
justify-content: flex-end;
align-items: center;
user-select: none;
pointer-events: none;
position: absolute;
right: 100%;
}

.line-count:before {
content: counter(lineCounter);
color: #434343;
pointer-events: none;
user-select: none;
}

.line-collapse-container {
    display: flex;
    width: 30px;
justify-content: center;
align-items: center;
}
.line-collapse {
    width: 15px;
    height: 15px;
    display: flex;
justify-content: center;
align-items: center;
}
.line-collapse * {
    color: #434343 !important;
}
.line-collapse:hover * {
    color: #628DD0 !important;
}

.line * {
    padding: 0px !important;
    margin: 0px !important;
    outline: none;
}

.line:has(hr) {
    display: flex;
    align-items: center;
}
.line hr {
    width: 100%;
}
.line:not(.active-line):has(hr) {
    color: transparent;
}
.active-line hr {
    display: none;
}
.active-line .line-contents{
    border-radius: 5px;
    background: #262626;
}

.md-code {
    color: #666666;
    display: none;
    pointer-events: none;
    white-space: pre;
    font-weight: bolder;
    user-select: none;
    padding: 0px !important;
}

.active-line .md-code {
    display: inline-block;
}

.connection span, .word span{
    color: #666666;
    display: none;
    pointer-events: none;
    white-space: pre;
    font-weight: bolder;
    user-select: none;
    padding: 0px !important;
}

.active-object span {
    display: inline-block;
}
.active-object {
    text-decoration: none;
}

.line-indent {
    width: 15px;
    height: 24px;
    background: red;
    border-left: 1px solid #363636;
}

.tree-node {
    position: relative;
    z-index: 1;
}

.node-indent {
    width: 15px;
    height: 28px ;
    transform: translateX(13px);
    border-left: 1px solid #4E4E4E;
}

.node-content {
    font-size: 14px;
    color: #B9B9B9;
    display: flex;
    padding-right: 10px;
    align-items: center;
}
.node-content-collapse {
    transition: transform ease-in-out .2s;
    position: relative;
}
.node-content::after {
    content: '';
    width: 1px;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 8px;
    background: #4F4F4F;
    display: none;
}
.node-content-collapse:hover * {
    color: #628DD0 !important;
}
.node-content-opened {
    transform: rotate(90deg);
}
.node-content::before {
content: '';
position: absolute;
top: 1px;
right: 1px;
height: 24px;
left: 1px;
border-radius: 3px;
z-index: -1;
transition: background ease-in-out 0.1s;
}
.node-content::before:last-child {
background: red;
}
.node-content:hover::before {
background: #363636;
}
.node-content-text {
    padding: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    width: 100%;
}

.treeview-container {
    padding: 10px;
    height: calc(100% - 60px);
    padding-bottom: 20px;
    overflow: scroll;
}
.node-file-name {
    padding: 1px;
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 3px;
    flex: 1;
}
.node-file-name:focus-within {
    outline: none;
}
.node-file-name:focus-within::before {
content: '';
position: absolute;
top: 0px;
right: 0px;
height: 26px;
left: 0px;
border-radius: 3px;
z-index: -1;
border: 1px solid #628DD0;;
}
.active-node::before {
content: '';
position: absolute;
top: 1px;
right: 1px;
height: 24px;
left: 1px;
border-radius: 3px;
z-index: -1;
background: #363636;
}
.drag-over-node::before {
content: '';
position: absolute;
top: 0px;
right: 0px;
height: 26px;
left: 0px;
border-radius: 3px;
z-index: -1;
border: 1px solid #628DD0;
}
#node-click-menu {
    position: absolute;
    border: 1px solid rgb(87, 87, 87);
    width: fit-content;
    min-height: 48px;
    border-radius: 5px;
    z-index: 101;
    background: rgba(45, 45, 45);
    height: fit-content;
    padding: 3px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.node-menu-item {
    font-size: 14px;
    min-width: 120px;
    display: flex;
    padding-left: 10px;
    color: #B9B9B9;
    justify-content: flex-start;
    align-items: center;
    border-radius: 3px;
}
.node-menu-item:hover {
    background: rgba(98, 141, 208, .7);
}
#main-vault {
    width: 100%;
    margin-left: 35px;
    font-size: 14px;
    color: rgb(218, 218, 218);
}
.main-node {
    font-weight: bold;
}
.active-instance {
    border-radius: 3px;
    color: #628DD0;
}
.line-contents:has(.active-instance) {
    outline: 1px solid #628DD0;
}

</style>