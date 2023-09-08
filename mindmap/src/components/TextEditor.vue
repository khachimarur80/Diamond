<template>
    <div id="text-content">
        <div id="text-toolbar">
            <div id="sidebar-history">
                <v-btn dense icon small @click="setHistory(1)" :disabled="historyIndex==fileHistory.length">
                    <v-icon small>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn dense icon small @click="setHistory(-1)" :disabled="historyIndex==0">
                    <v-icon small>mdi-arrow-right</v-icon>
                </v-btn>
            </div>
            <span class="file-name">
                {{ this.file }}
            </span>
            <v-btn @click="changeTextViewMode" icon color="secondary" id="text-view-mode" small>
                <v-icon v-if="textViewMode=='read'" size="20">
                    mdi-pencil-outline
                </v-icon>
                <v-icon v-if="textViewMode=='edit'" size="20">
                    mdi-book-open-blank-variant
                </v-icon>
            </v-btn>
        </div>
        <div id="text-display">
            <div id="text" contenteditable v-show="file" @mousedown="textMouseDown" @keydown="textKeyDown" @keyup="textKeyUp" @blur="textBlur" @mouseup="textMouseUp" @paste="textPaste">
            </div>
            <div id="autocomplete" v-if="autocomplete.word && autocompleteItems.length" :style="{ top: autocomplete.y + 'px', left: autocomplete.x + 'px', maxHeight: autocomplete.height + 'px'}">
                <div v-for="(item, i) in autocompleteItems" :key="i" @click="completeText(item)" :class="{ selectedPrediction: autocomplete.index == i }" class="prediction">{{ item.name }}</div>
            </div>
        </div>
        <div id="resizeBarMiddle">
        </div>
    </div>
</template>
<script>
    //import EventBus from '@/event-bus'

    export default {
        name: 'TextEditor',
        data: () => ({
            historyIndex: 0,
            fileHistory: [],
            textViewMode: 'edit',
            autocomplete: {
                x: 0,
                y: 0,
                caret: null,
                index: 0,
                begginning: false,
                word: null,
                height: 150,
            },
        }),
        props: {
            file: {
                type: String,
                required: true,
            },
        },
        methods: {
            changeTextViewMode() {
                if (this.textViewMode=='edit') {
                    this.textViewMode = 'read'
                    document.getElementById('text').classList.add('reading')
                    document.getElementById('text').setAttribute('contenteditable', 'false')
                }
                else {
                    this.textViewMode = 'edit'
                    document.getElementById('text').classList.remove('reading')
                    document.getElementById('text').setAttribute('contenteditable', 'true')
                }
            },
            textMouseDown() {

            },
            textMouseUp() {

            },
            textKeyDown() {

            },
            textKeyUp() {

            },
            textBlur() {

            },
            textPaste() {
                
            }
        },
    }
</script>