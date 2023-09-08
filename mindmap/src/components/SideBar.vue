<template>
    <div id="sidebar">
        <div class="content-wrapper">
            <div id="resizeBarLeft">
            </div>
            <div id="sidebar-menu">
                <div id="sidebar-menu-core">
                    <v-btn small icon dense>
                        <v-icon size="20" color="secondary" @click="exitVault">
                            mdi-folder-arrow-left-outline
                        </v-icon>
                    </v-btn>
                    <v-btn small icon dense>
                        <v-icon size="20" color="secondary" @click="userHelp">
                            mdi-help-circle-outline
                        </v-icon>
                    </v-btn>
                    <v-btn small icon dense>
                        <v-icon size="20" color="secondary" @click="openSettings">
                            mdi-cog-outline
                        </v-icon>
                    </v-btn>
                </div>
            </div>
            <div id="sidebar-contents">
                <div id="sidebar-toolbar">
                    <v-btn small icon dense @click="createFile">
                        <v-icon size="20" color="secondary">
                            mdi-note-edit-outline
                        </v-icon>
                    </v-btn>
                    <v-btn small icon dense @click="createFolder">
                        <v-icon size="20" color="secondary">
                            mdi-folder-plus-outline
                        </v-icon>
                    </v-btn>
                    <v-btn small icon dense @click="toggleTreeview">
                        <v-icon size="20" color="secondary" v-if="treeViewOpened">
                            mdi-unfold-less-horizontal
                        </v-icon>
                        <v-icon size="20" color="secondary" v-else>
                            mdi-unfold-more-horizontal
                        </v-icon>
                    </v-btn>
                </div>
                <div id="node-click-menu" v-if="clickMenu.opened" @blur="hideContextMenu"
                    :style="{'top' : clickMenu.y + 'px', 'left' : clickMenu.x + 'px'}" tabindex="1">
                    <div class="node-menu-item" @click="renameFile">
                        Rename
                    </div>
                    <div class="node-menu-item" @click="removeNodeFile">
                        Delete
                    </div>		
                </div>
                <TreeView :items="items" :vault="vault"></TreeView>
            </div>
        </div>
    </div>
</template>

<script>

    import TreeView from './TreeView';
    import EventBus from '../event-bus.js';

    export default {
        name: 'SideBar',
        data: () => ({
            treeViewOpened: true,
            showUserHelp: false,
            clickMenu: {
                opened: false,
                x: 0,
                y: 0,
                node: null,
            },
        }),
        components: {
            TreeView,
        },
        props: {
            items: {
                type: Array,
                required: true,
            },
            vault: {
                type: String,
                required: true,
            },
        },
        methods: {
            exitVault() {
                window.electronAPI.exitVault()
            },
            userHelp() {
                this.showUserHelp = !this.showUserHelp
            },
            openSettings() {

            },
            async createFile() {
                if (this.file) {
                    const message = await new Promise(resolve => {
                        window.electronAPI.createFile(this.file)
                        window.electronAPI.response('create-file-response', resolve)
                    });
                    EventBus.$emit('createFile', message)
                }
                else {
                    const message = await new Promise(resolve => {
                        window.electronAPI.createFile(this.vault)
                        window.electronAPI.response('create-file-response', resolve)
                    });
                    EventBus.$emit('createFile', message)
                }
            },
            createFolder() {
                EventBus.$emit('createFolder')    
            },
            toggleTreeview() {
                this.treeViewOpened = !this.treeViewOpened
                const opened = this.treeViewOpened
                EventBus.$emit('toggleTreeview', opened)
            },
            nodeMouseDown(event) {
                this.clickMenu.opened = true
                this.clickMenu.x = event.clientX
                this.clickMenu.y = event.clientY - 40
                this.clickMenu.node = event.target
                this.$nextTick(()=>{
                    document.getElementById('node-click-menu').focus()
                })
            },
            renameFile() {
                var target = this.clickMenu.node
                target.setAttribute('contenteditable', 'true')
                const range = document.createRange();
                range.selectNodeContents(target);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            },
            hideContextMenu() {
                this.clickMenu.opened = false
            },
            removeNodeFile() {
                this.clickMenu.opened = false
                var target = this.clickMenu.node
                EventBus.$emit('removeNodeFile', target)
            },
        },
        created() {
            EventBus.$on('nodeMouseDown', this.nodeMouseDown)
        }
    }
</script>