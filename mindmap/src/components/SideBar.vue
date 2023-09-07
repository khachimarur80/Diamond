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

    export default {
        name: 'SideBar',
        data: () => ({
            treeViewOpened: true,
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

            },
            userHelp() {

            },
            openSettings() {

            },
            createFile() {

            },
            createFolder() {

            },
            toggleTreeview() {

            },
            clickMenu() {

            },
        },
    }
</script>

<style>
    #sidebar .content-wrapper {
        display: flex;
        height: 100%;

    }
    #sidebar-contents {
        flex: 1;
        overflow: hidden;
        height: 100%;
        position: relative;
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

    #sidebar {
        height: 100%;
        background: #262626;
        position: relative;
        transition: margin 0.15s ;
        user-select: none;
        width: 245px;
    }
</style>