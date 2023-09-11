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
    import EventBus from '@/event-bus'
    import { marked } from 'marked';
    
    class Connection {
        constructor() {
            this.id = Math.floor(Math.random()*100000) 
            this.name = "Connection "+this.id
            this.objectType = "Connection"
            this.file = ""
            this.categories = []
            this.connections = []
            this.instances = {}
            this.directionality = 'lr'
            this.upgrade = false
        }
    }
    class Word {
        constructor() {
            this.id = Math.floor(Math.random()*100000)
            this.name = ""
            this.x = 100
            this.y = 100
            this.objectType = "Word"
            this.file = ""
            this.connections = []
            this.categories = []
            this.instances = {}
        }
    }

    class EscapeListsTablesRenderer extends marked.Renderer {
        listitem(text) {
            return text;
        }

        tablecell(content) {
            return content;
        }
    }

    const keysPressed = {};

    const customRenderer = new EscapeListsTablesRenderer();

    marked.setOptions({
        renderer: customRenderer
    })

    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    /*function getCaretPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const caretOffset = range.startOffset;
            const caretRect = range.getBoundingClientRect();
            return {
            offset: caretOffset,
            y: caretRect.bottom // Use the bottom Y position of the caret rectangle
            };
        }
        return null;
    }*/

    function getCursorPosition(parent, node, offset, stat) {
        if (stat.done) return stat;

        let currentNode = null;
        if (parent.childNodes.length == 0) {
            stat.pos += parent.textContent.length;
        } else {
            for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
            currentNode = parent.childNodes[i];
            if (currentNode === node) {
                stat.pos += offset;
                stat.done = true;
                return stat;
            } else getCursorPosition(currentNode, node, offset, stat);
            }
        }
        return stat;
        }

    function setCursorPosition(parent, range, stat) {
        if (stat.done) return range;

        if (parent.childNodes.length == 0) {
            if (parent.textContent.length >= stat.pos) {
            range.setStart(parent, stat.pos);
            stat.done = true;
            } else {
            stat.pos = stat.pos - parent.textContent.length;
            }
        } else {
            for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
                let currentNode = parent.childNodes[i];
                setCursorPosition(currentNode, range, stat);
            }
        }
        return range;
    }
    function getCaretGlobalPosition() {
        const selection = document.getSelection();
        
        if (!selection.rangeCount) {
            return null; // No selection/range available
        }
        
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        let rect, r2;

        if (offset > 0) {
            r2 = document.createRange();
            r2.setStart(node, offset - 1);
            r2.setEnd(node, offset);
            rect = r2.getBoundingClientRect();
            return { left: rect.right , top: rect.bottom};
        }
        else {
            rect = node.getBoundingClientRect();
            return { left: rect.left, top: rect.top + 30, begginning: true};
        }
    }

    function getElementIndex(text, match, occurrence) {
        const regex = new RegExp(match, 'g');
        let matchCount = 0;
        let matchIndex = -1;
        let matchResult = regex.exec(text);

        while (matchResult !== null) {
            matchCount++;
            if (matchCount === occurrence) {
            matchIndex = matchResult.index;
            break;
            }
        }

        return matchIndex;
    }


    /*function setCaretPosition(index, element) {
        const range = document.createRange();
        const selection = window.getSelection();

        if (element.childNodes.length > 0) {
        let currentNode = element.childNodes[0];
        let charCount = 0;
        while (currentNode) {
            const nextNode = currentNode.nextSibling;
            if (currentNode.nodeType === Node.TEXT_NODE) {
            const nodeLength = currentNode.textContent.length;
            if (charCount + nodeLength >= index) {
                range.setStart(currentNode, index - charCount);
                range.setEnd(currentNode, index - charCount);
                break;
            }
            charCount += nodeLength;
            }
            currentNode = nextNode;
        }

        // Clear any existing selections and set the new range as the selection
        selection.removeAllRanges();
        selection.addRange(range);

        // Focus the contenteditable element
        element.focus();
        }
    }*/

    function wrapMarkdownSyntax(inputString) {
        const headerRegex = /^(#+)\s(.*)$/gm;
        const lineRegex = /^---+$/gm;
        const emphasisRegex = /(_.*?_)/g;
        const strongRegex = /(\*\*.*?\*\*)/g;
        const strikeThroughRegex = /~~.*?~~/g; 
        const emphasisRegex2 = /(_)/g;
        const strongRegex2 = /(\*\*)/g;
        const strikeThroughRegex2 = /~~/g;
        const tabRegex = /^\t(.*)$/gm;

        const wrappedString = inputString
            .replace(headerRegex, '<span class="md-code">$1 </span>$2')
            .replace(lineRegex, '<span class="md-code">$&</span>')
            //.replace(listRegex, '<span class="md-code">$1</span>')
            //.replace(orderedListRegex, '<span class="md-code">$1</span>$2')
            .replace(emphasisRegex, '<em>$&</em>')
            .replace(strongRegex, '<strong>$&</strong>')
            .replace(strikeThroughRegex, '<del>$&</del>')
            .replace(emphasisRegex2, '<span class="md-code md-style">$&</span>')
            .replace(strongRegex2, '<span class="md-code md-style">$&</span>')
            .replace(strikeThroughRegex2, '<span class="md-code md-style">$&</span>')
            .replace(tabRegex, '<span class="md-tab">$&</span>')

        return wrappedString;
    }

    function findSelectedDivs(node, range) {
        const selectedDivs = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null, false);

        let currentNode = walker.nextNode();

        while (currentNode) {
            if (currentNode.nodeName === 'DIV') {
                const nodeRange = document.createRange();
                nodeRange.selectNodeContents(currentNode);

                if (range.intersectsNode(currentNode)) {
                    selectedDivs.push(currentNode);
                }

                if (nodeRange.compareBoundaryPoints(Range.END_TO_END, range) >= 0) {
                    break;
                }
            }

            currentNode = walker.nextNode();
        }
        return selectedDivs
    }

    function getCurrentWord() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;
        
        if (startContainer.nodeType === Node.TEXT_NODE) {
            const text = startContainer.textContent;
            let wordStart = startOffset;
            let wordEnd = startOffset;
            
            while (wordStart > 0 && text[wordStart - 1].match(/\w/)) {
            wordStart--;
            }
            
            while (wordEnd < text.length && text[wordEnd].match(/\w/)) {
            wordEnd++;
            }
            
            return text.substring(wordStart, wordEnd);
        }
        
        return "";
    }

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
            currentGroup: {
                type: Object,
                required: true,
            },
        },
        methods: {
            setHistory(direction) {
                this.historyIndex += direction
                this.navigated = true
                if (undefined == this.fileHistory[this.historyIndex]) {
                    EventBus.$emit('setHistory', '')
                }
                else {
                    EventBus.$emit('setHistory', this.fileHistory[this.historyIndex])
                }
            },
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
            completeText(item) {
                if (this.autocomplete.caret !== null) {
                    const containerNode = this.autocomplete.caret.containerNode;
                    const offset = this.autocomplete.caret.offset;
                    let completedText;

                    if (item.objectType=='Word') {
                        if (containerNode.previousSibling && !containerNode.nextSibling) {
                            if (containerNode.previousSibling.textContent==']') {
                            completedText = item.name+']';
                        }
                        else {
                            completedText = '['+item.name+']';
                        }
                        }
                        else if (!containerNode.previousSibling && containerNode.nextSibling) {
                            if (containerNode.nextSibling.textContent==']') {
                            completedText = '['+item.name;
                        }
                        else {
                            completedText = '['+item.name+']';
                        }
                        }
                        else if (containerNode.previousSibling && containerNode.nextSibling) {
                            if (containerNode.previousSibling.textContent=='[' && containerNode.nextSibling.textContent!=']') {
                            completedText = item.name+'[';
                        }
                        else if (containerNode.previousSibling.textContent!='[' && containerNode.nextSibling.textContent==']') {
                            completedText = '['+item.name;
                        }
                        else if (containerNode.previousSibling.textContent=='[' && containerNode.nextSibling.textContent==']') {
                            completedText = item.name;
                        }
                        else {
                            completedText = '['+item.name+']';
                        }
                        }
                        else {
                            completedText = '['+item.name+']';
                        }
                }
                else if (item.objectType=='Connection') {
                    if (containerNode.previousSibling && !containerNode.nextSibling) {
                        if (containerNode.previousSibling.textContent=='-') {
                            completedText = item.name+'-';
                        }
                        else {
                            completedText = '-'+item.name+'-';
                        }
                        }
                        else if (!containerNode.previousSibling && containerNode.nextSibling) {
                            if (containerNode.nextSibling.textContent=='-') {
                            completedText = '-'+item.name;
                        }
                        else {
                            completedText = '-'+item.name+'-';
                        }
                        }
                        else if (containerNode.previousSibling && containerNode.nextSibling) {
                            if (containerNode.previousSibling.textContent=='-' && containerNode.nextSibling.textContent!='-') {
                            completedText = item.name+'-';
                        }
                        else if (containerNode.previousSibling.textContent!='-' && containerNode.nextSibling.textContent=='-') {
                            completedText = '-'+item.name;
                        }
                        else if (containerNode.previousSibling.textContent=='-' && containerNode.nextSibling.textContent=='-') {
                            completedText = item.name;
                        }
                        else {
                            completedText = '-'+item.name+'-';
                        }
                    }
                    else {
                        completedText = '-'+item.name+'-';
                    }
                }
                else {
                    completedText = item.name.slice(this.autocomplete.word.length);
                } 

                    const newText = containerNode.textContent.slice(0, offset - this.autocomplete.word.length) + completedText + containerNode.textContent.slice(offset);
                    containerNode.textContent = newText;

                    const newOffset = offset - this.autocomplete.word.length + completedText.length;

                    const range = document.createRange();
                    range.setStart(containerNode, newOffset);
                    range.setEnd(containerNode, newOffset);

                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    this.autocomplete.caret = null;
                    }

                this.autocomplete.caret = null;
                this.autocomplete.word = null

                this.saveContents()
            },
            async renderMarkdown(line) {
                const content = line.getAttribute('data-text').replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')
                let element = line.querySelector('.line-contents')

                element.innerHTML = marked.parse(content)

                if (element.firstElementChild) {
                    if (element.firstElementChild.tagName=='HR') {
                        element.innerHTML = marked.parse(content)
                        let hrCode = document.createElement('span')
                        hrCode.classList.add('md-code')
                        hrCode.classList.add('md-hr')
                        hrCode.textContent = '---'
                        element.insertBefore(hrCode, element.firstElementChild)
                    }
                    else  {
                        element.firstElementChild.innerHTML = wrapMarkdownSyntax(content
                            .replace(/\[([A-Za-z0-9\s]+)\]/g, '<span class="word" contenteditable="false"><span>[</span>$1<span>]</span></span>')
                .replace(/-([A-Za-z0-9\s]+)-/g, '<span class="connection" contenteditable="false"><span>-</span>$1<span>-</span></span>'))
                    }
                }
                else {
                    element.innerHTML = '<br>'
                }

                this.$nextTick(async ()=>{
                    let connections = element.querySelectorAll('.connection');
                    let words = element.querySelectorAll('.word');

                    for (let i = 0; i < connections.length; i++) {
                    let fullConnectionText = connections[i].textContent.trim();
                    let connectionText = fullConnectionText.substring(1, fullConnectionText.length - 1)
                    
                    let targetConnection = this.currentGroup.connections.find(connection => connection.name === connectionText);
                    if (targetConnection) {
                        connections[i].setAttribute('data-id', targetConnection.id);
                    }
                    else {
                        let newConnection = new Connection()
                            newConnection.name = connectionText
                            EventBus.$emit('pushConnectionToCurrentGroup', newConnection)
                            connections[i].setAttribute('data-id', newConnection.id);
                        
                        try {
                        const message = await new Promise(resolve => {
                            window.electronAPI.requestLoadConnection(this.currentGroup.file, newConnection.name);
                            window.electronAPI.response('load-connection-response', resolve);
                        });
                        
                        newConnection.file = message;
                        } catch (error) {
                        console.error('Error loading word:', error);
                        }
                        
                    }
                    }
                    for (let i = 0; i < words.length; i++) {
                    let fullWordText = words[i].textContent.trim()
                    let wordText = fullWordText.substring(1, fullWordText.length - 1);

                    let fullConnection = [words[i]]
                    let currentNode = words[i]
                    while (currentNode.previousSibling) {
                        currentNode = currentNode.previousSibling
                        if (currentNode.classList) {
                            if (currentNode.classList.contains('connection')) {
                                if (fullConnection.length==1) {
                                    fullConnection.push(currentNode)
                                }
                                else {
                                    break
                                }
                            }
                            else if (currentNode.classList.contains('word')) {
                                if (fullConnection.length==2) {
                                    fullConnection.push(currentNode)
                                }
                                else {
                                    break
                                }
                            }
                            else {
                                break
                            }
                        }
                        else if (currentNode.nodeValue.trim()!='') {
                            break
                        }
                        else if (fullConnection.length==3) {
                            break
                        }
                    }
                    let targetWord = this.currentGroup.words.find(word => word.name === wordText);
                    if (targetWord) {
                        words[i].setAttribute('data-id', targetWord.id);
                    }
                    else {
                        let newWord = new Word();
                        newWord.name = wordText;
                        EventBus.$emit('pushWordToCurrentGroup', newWord)
                        words[i].setAttribute('data-id', newWord.id);
                        
                        try {
                        const message = await new Promise(resolve => {
                            window.electronAPI.requestLoadWord(this.currentGroup.file, newWord.name);
                            window.electronAPI.response('load-word-response', resolve);
                        });
                        
                        newWord.file = message;
                        } catch (error) {
                        console.error('Error loading word:', error);
                        }
                    }
                    }
                    this.$nextTick( async ()=>{
                        let globalObjects = document.querySelectorAll('.connection, .word')
                        let visited = []
                        globalObjects.forEach(element => {
                            let line = element.parentElement
                            while (!line.classList.contains('line')) {
                                line = line.parentElement
                            }

                            let object
                            let i
                            if (element.classList.contains('connection')) {
                                object = this.getConnectionById(element.getAttribute('data-id'))
                                i = Array.from(line.querySelectorAll('.connection')).indexOf(element)
                            }
                            else {
                                object = this.getWordById(element.getAttribute('data-id'))
                                i = Array.from(line.querySelectorAll('.word')).indexOf(element)
                            }
                            const true_id = object.id+'-'+this.file+'-'+Array.from(document.querySelectorAll('.line')).indexOf(line)
                            +'-'+i+'-'+getElementIndex(line.textContent, element.textContent, i+1)

                        if (!visited.includes(object.id)) {
                            object.instances[this.file] = []
                            visited.push(object.id)
                        }
                        if (object.instances[this.file]) {
                            object.instances[this.file].push([
                                object.id,
                                this.file,
                                Array.from(document.querySelectorAll('.line')).indexOf(line),
                                i,
                                getElementIndex(line.textContent, element.textContent, i+1)
                            ])
                        }
                        else {
                            object.instances[this.file] = [true_id]
                        }
                        element.id = true_id
                        })
                    })
                })


                if (element.querySelector('h1')) {
                    element.previousElementSibling.style.height = '48px'
                }
                else if (element.querySelector('h2')) {
                    element.previousElementSibling.style.height = '36px'
                }
                else if (element.querySelector('h3')) {
                    element.previousElementSibling.style.height = '28px'
                }
                else if (element.querySelector('h4')) {
                    element.previousElementSibling.style.height = '24px'
                }
                else if (element.querySelector('h5')) {
                    element.previousElementSibling.style.height = '20px'
                }
                else if (element.querySelector('h6')) {
                    element.previousElementSibling.style.height = '16px'
                }
                else {
                    element.previousElementSibling.style.height = '24px'
                }
            },
            createLine(content) {
                let newLine = document.createElement('div')
                newLine.classList.add('line')
                newLine.setAttribute('tabindex', '1')
                newLine.setAttribute('data-text', content)

                let lineCount = document.createElement('div')
                lineCount.classList.add('line-count')
                lineCount.setAttribute('contenteditable', 'false')

                let lineCollapseContainer = document.createElement('div')
                lineCollapseContainer.classList.add('line-collapse-container')
                lineCollapseContainer.setAttribute('contenteditable', 'false')

                let lineCollapse = document.createElement('div')
                lineCollapse.classList.add('line-collapse')
                lineCollapse.innerHTML = '<i aria-hidden="true" class="v-icon notranslate mdi mdi-chevron-down theme--dark" style="font-size: 16px"></i>'
                lineCollapseContainer.appendChild(lineCollapse)

                let lineContents = document.createElement('div')
                lineContents.classList.add('line-contents')


                //newLine.appendChild(lineCollapseContainer)
                newLine.appendChild(lineCount)
                newLine.appendChild(lineContents)

                return newLine
            },
            textBlur(event) {
                event.stopPropagation()
                this.autocomplete.word = null
            },
            textMouseDown(event) {
                if (document.querySelector('.active-instance')) {
                    document.querySelectorAll('.active-instance').forEach(e => e.classList.remove('active-instance'))
                }
                const selection = window.getSelection();
                selection.removeAllRanges();

                this.autocomplete.word = null
                let target = event.target
                if (target.classList.contains('word')) {
                    let wordObj = this.getWordById(target.getAttribute('data-id'))
                    EventBus.$emit('setSelectedObject', wordObj)
                }
                else if (target.classList.contains('connection')) {
                    let connectionObj = this.getConnectionById(target.getAttribute('data-id'))
                    EventBus.$emit('setSelectedObject', connectionObj)
                }
                else {
                    while (!target.classList.contains('line')) {
                        target = target.parentElement
                        if (!target) {
                            break
                        }
                    }
                    if (target) {
                        document.querySelectorAll('.active-line').forEach(element => element.classList.remove('active-line'))

                        this.currentLine = target
                        this.currentLine.classList.add('active-line')
                    }
                    else {
                        event.preventDefault()
                    }
                }
            },
            textMouseUp(event) {
                let target = event.target
                if (target.classList.contains('word') || target.classList.contains('connection')) {
                    event.stopPropagation();
                }
                else if (target.classList.contains('line-collapse') || target.classList.contains('line-collapse-container') || target.parentElement.classList.contains('line-collapse')) {
                    event.preventDefault()
                }
                else {
                    document.querySelectorAll('.active-line').forEach(element => element.classList.remove('active-line'))

                    let selectedLines = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))
                    selectedLines = selectedLines.filter(e => e.classList.contains('line'))

                    selectedLines.forEach(element => element.classList.add('active-line'))

                    if (selectedLines.length === 1) {
                        const selection = window.getSelection();
                        const caretPosition = selection.anchorOffset;
                        const currentNode = selection.anchorNode;

                        const textBeforeCaret = selectedLines[0].textContent.substring(0, caretPosition);
                    const textAfterCaret = selectedLines[0].textContent.substring(caretPosition);

                    document.querySelectorAll('.active-object').forEach(e => e.setAttribute('contenteditable', 'false'))
                    document.querySelectorAll('.active-object').forEach(e => e.classList.remove('active-object'))

                        if ((!textBeforeCaret.trim() || textBeforeCaret.trim() === ' ') && currentNode.previousSibling) {
                            currentNode.previousSibling.classList.add('active-object')
                            currentNode.previousSibling.setAttribute('contenteditable', 'true')
                        }
                        if ((!textAfterCaret.trim() || textAfterCaret.trim() === ' ') && currentNode.nextSibling) {
                            currentNode.nextSibling.classList.add('active-object')
                            currentNode.nextSibling.setAttribute('contenteditable', 'true')
                        }
                    }
                }
            },
            textKeyUp(event) {
                event.preventDefault()
                if (!this.currentLine) {
                    this.currentLine = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))[0]
                    this.currentLine.classList.add('active-line')
                }
                const selection = window.getSelection();
                let currentLines;
                if (selection.rangeCount>0) {
                    currentLines = findSelectedDivs(document.getElementById('text'), selection.getRangeAt(0)).filter(e => e.classList.contains('line'))
                }
                else {
                    currentLines = []
                }

                if (currentLines.length===1) {
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        if (this.autocomplete.word && this.autocompleteItems.length) {
                            event.preventDefault()
                        }
                        else {
                            let newLine = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))[0]
                            if (event.key === 'ArrowUp' && newLine) {
                                if (newLine.previousElementSibling) {
                                    event.preventDefault()
                                    document.querySelectorAll('.active-line').forEach(element => element.classList.remove('active-line'))
                                    this.currentLine = newLine.previousElementSibling
                                    this.currentLine.classList.add('active-line')

                                    if (this.currentLine.querySelector('hr')) {
                                        setTimeout(()=>{
                                            placeCaretAtEnd(this.currentLine.querySelector('.line-contents'))
                                        })
                                    }

                                    placeCaretAtEnd(this.currentLine.querySelector('.line-contents'))
                                }
                            }
                            else if (event.key === 'ArrowDown' && newLine) {
                                event.preventDefault()
                                document.querySelectorAll('.active-line').forEach(element => element.classList.remove('active-line'))
                                this.currentLine = newLine
                                this.currentLine.classList.add('active-line')

                                if (this.currentLine.querySelector('hr')) {
                                    setTimeout(()=>{
                                        placeCaretAtEnd(this.currentLine.querySelector('.line-contents'))
                                    })
                                }

                                placeCaretAtEnd(this.currentLine.querySelector('.line-contents'))
                            }
                        }
                    } 
                    else if (event.key.length === 1 && !(keysPressed['meta'] || keysPressed['ctrl'])) {
                        if (keysPressed['a']) {
                            //document.querySelectorAll('.active-line').forEach(e => e.classList.remove('active-line'))
                        }
                        else {
                        if (event.key === ' ') {
                            this.autocomplete.word = null
                        } 
                        else {
                            let currentWord = getCurrentWord(this.currentLine)
                            let textRect = document.getElementById('text-display').getBoundingClientRect()
                            let rect = getCaretGlobalPosition()

                            this.autocomplete.word = currentWord
                            this.autocomplete.x = rect.left - textRect.left
                            this.autocomplete.y = rect.top - textRect.top + 30
                            this.autocomplete.height = textRect.height -  this.autocomplete.y + 30
                        }
                        this.currentLine.setAttribute('data-text', this.currentLine.textContent)
                            const sel = window.getSelection();
                            const node = sel.focusNode;
                            const offset = sel.focusOffset;
                            const pos = getCursorPosition(document.getElementById('text'), node, offset, { pos: 0, done: false });

                            if (offset === 0) pos.pos += 0.5;

                            
                            this.renderMarkdown(this.currentLine)

                            sel.removeAllRanges();

                            const range = setCursorPosition(document.getElementById('text'), document.createRange(), {
                                pos: pos.pos,
                                done: false,
                            });

                            range.collapse(true);
                            sel.addRange(range);
                        }
                    } 
                    else if (event.key === 'Tab') {
                        if (this.autocomplete.word && this.autocompleteItems.length>0) {
                            event.preventDefault()
                            let selection = window.getSelection();
                            if (selection.rangeCount > 0) {
                            let range = selection.getRangeAt(0);
                            this.autocomplete.caret = {
                            containerNode: range.startContainer,
                            offset: range.startOffset
                        };
                            }
                        this.completeText(this.autocompleteItems[this.autocomplete.index])
                        }
                        else {
                            event.preventDefault()
                            this.currentLine.setAttribute('data-text', this.currentLine.textContent.replace(/\n$/, '') + '&nbsp;&nbsp;&nbsp;&nbsp;')
                            const sel = window.getSelection();
                            const node = sel.focusNode;
                            const offset = sel.focusOffset;
                            const pos = getCursorPosition(document.getElementById('text'), node, offset, { pos: 0, done: false });

                            if (offset === 0) pos.pos += 0.5;

                            
                            this.renderMarkdown(this.currentLine)

                            sel.removeAllRanges();

                            const range = setCursorPosition(document.getElementById('text'), document.createRange(), {
                                pos: pos.pos + 4,
                                done: false,
                            });

                            range.collapse(true);
                            sel.addRange(range);
                        }
                    }
                    else if (event.key === 'Enter') {
                        if (event.shiftKey) {
                            event.preventDefault()
                        }
                        else {
                            let newLine = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))[0]
                            this.currentLine = newLine
                            this.currentLine.classList.add('active-line')

                            document.documentElement.style.setProperty('--line-count', document.querySelectorAll('.line').length.toString().length);
                        }
                    }
                    else if (event.key === 'Backspace') {
                        document.documentElement.style.setProperty('--line-count', document.querySelectorAll('.line').length.toString().length);
                    if (!document.querySelector('.line-count')) {
                        if (document.querySelectorAll('.line').length == 0) {
                            let lineCount = document.createElement('div')
                                lineCount.classList.add('line-count')
                                lineCount.style.height = '24px'

                                let line = document.getElementById('text').querySelector('.line')
                                let lineContents = document.getElementById('text').querySelector('.line-contents')

                            line.insertBefore(lineCount, lineContents)

                            placeCaretAtEnd(lineContents)
                        }
                        else {
                            document.getElementById('text').innerHTML = ''
                            let newLine = this.createLine('')
                            this.renderMarkdown(newLine)
                            document.getElementById('text').appendChild(newLine)
                            placeCaretAtEnd(newLine.querySelector('.line-contents'))
                            this.currentLine = newLine
                            newLine.classList.add('active-line')
                        }
                    }
                    else {
                        try {
                            let currentWord = getCurrentWord(this.currentLine)
                            let textRect = document.getElementById('text-display').getBoundingClientRect()
                            let rect = getCaretGlobalPosition()

                            this.autocomplete.word = currentWord
                            this.autocomplete.x = rect.left - textRect.left
                            this.autocomplete.y = rect.top - textRect.top + 30
                            this.autocomplete.height = textRect.height -  this.autocomplete.y + 30

                                this.currentLine.setAttribute('data-text', this.currentLine.textContent)
                                let currentLine = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))[0]
                                currentLine.classList.add('active-line')

                                let element = this.currentLine.querySelector('.line-contents')
                                if (element.previousElementSibling) {
                                    if (element.querySelector('h1')) {
                                        element.previousElementSibling.style.height = '48px'
                                    }
                                    else if (element.querySelector('h2')) {
                                        element.previousElementSibling.style.height = '36px'
                                    }
                                    else if (element.querySelector('h3')) {
                                        element.previousElementSibling.style.height = '28px'
                                    }
                                    else if (element.querySelector('h4')) {
                                        element.previousElementSibling.style.height = '24px'
                                    }
                                    else if (element.querySelector('h5')) {
                                        element.previousElementSibling.style.height = '20px'
                                    }
                                    else if (element.querySelector('h6')) {
                                        element.previousElementSibling.style.height = '16px'
                                    }
                                    else {
                                        element.previousElementSibling.style.height = '24px'
                                    }
                                }
                            }
                            catch {
                                null
                            }
                        }
                    }
                    else if ((keysPressed['a'] && keysPressed['meta']) || (keysPressed['a'] && keysPressed['ctrl'])) {
                        keysPressed['meta'] = false
                        keysPressed['ctrl'] = false
                    }
                    this.saveContents()
                }
                else {
                    if (event.key === 'Tab') {
                        event.preventDefault()
                            currentLines.forEach(line => {
                                line.setAttribute('data-text', '&nbsp;&nbsp;&nbsp;&nbsp;' + line.textContent.replace(/\n$/, ''))
                                this.renderMarkdown(line)
                            })
                    }
                }
            },
            textKeyDown(event) {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    if (this.autocomplete.word && this.autocompleteItems.length) {
                        event.preventDefault()
                        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                            if (this.autocomplete.index > 0) {
                                this.autocomplete.index -= 1
                            }
                        }
                        else {
                            if (this.autocompleteItems.length-1>this.autocomplete.index) {
                                this.autocomplete.index += 1
                            }
                        }
                    }
                }
                else if (event.key === 'Backspace') {
                    let currentLines = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line')).filter(e => e.classList.contains('line'))

                    if (currentLines.length===1) {
                        if (currentLines[0].querySelector('.line-contents').textContent==='' ||
                            currentLines[0].querySelector('.line-contents').textContent==='\n') {
                            if (currentLines[0].querySelector('.line-contents').innerHTML!='<br>') {
                                event.preventDefault()
                                currentLines[0].querySelector('.line-contents').innerHTML = '<br>'
                            }
                            else if (currentLines[0].querySelector('.line-contents').innerHTML=='<br>'&&document.querySelectorAll('.line').length==1) {
                                event.preventDefault()
                            }
                            else {
                                event.preventDefault()
                                if (currentLines[0].previousElementSibling) {
                                    this.currentLine = currentLines[0].previousElementSibling
                                    placeCaretAtEnd(currentLines[0].previousElementSibling.querySelector('.line-contents'))

                                    currentLines[0].remove()
                                    currentLines[0].classList.add('active-line')
                                }
                            }
                            currentLines[0].classList.add('active-line')
                        }
                    }
                    else {
                        event.preventDefault()
                    const sel = window.getSelection();
                    const range = sel.getRangeAt(0);
                    const firstLine = range.startContainer;
                    const lastLine = range.endContainer;
                    const firstLineIndex = range.startOffset + currentLines[0].innerText.length - firstLine.length;
                    const lastLineIndex = range.endOffset + currentLines[currentLines.length-1].innerText.length - lastLine.length;

                        let lastLineText = currentLines[currentLines.length-1].getAttribute('data-text').slice(lastLineIndex)
                        currentLines.slice(1).forEach(line => {
                            line.remove()
                    });

                    currentLines[0].setAttribute('data-text', currentLines[0].getAttribute('data-text').slice(0, firstLineIndex) + lastLineText);
                    this.renderMarkdown(currentLines[0])

                    sel.removeAllRanges();

                    const range1 = setCursorPosition(currentLines[0].querySelector('.line-contents'), document.createRange(), {
                            pos: firstLineIndex,
                            done: false,
                        });

                        range1.collapse(true);
                        sel.addRange(range1);
                    }
                } 
                else if (event.key === 'Enter') {
                    let currentLines = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line')).filter(e => e.classList.contains('line'))
                    let currentLine = currentLines[0]

                    if (currentLines.length===1) {
                    if (this.autocomplete.word && this.autocompleteItems.length>0) {
                        event.preventDefault()
                        let selection = window.getSelection();
                            if (selection.rangeCount > 0) {
                            let range = selection.getRangeAt(0);
                            this.autocomplete.caret = {
                            containerNode: range.startContainer,
                            offset: range.startOffset
                        };
                            }
                        this.completeText(this.autocompleteItems[this.autocomplete.index])
                        this.autocomplete.word = null
                    }
                    else if (currentLine.innerHTML!='<br>') {
                        event.preventDefault()
                        let newLine = this.createLine('')
                        this.renderMarkdown(newLine)

                        while (!currentLine.classList.contains('line')) {
                            currentLine = currentLine.parentElement
                            if (!currentLine) {
                                break
                            }
                        }

                        document.querySelectorAll('.active-line').forEach(element => element.classList.remove('active-line'))
                        currentLine.insertAdjacentElement('afterend', newLine);

                        this.currentLine = newLine
                        this.currentLine.classList.add('active-line')
                        placeCaretAtEnd(newLine.querySelector('.line-contents'))
                    }
                    else {
                        let newLine = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))[0]
                        newLine.classList.remove('active-line')
                    }
                    }
                    else {
                        event.preventDefault()
                    const sel = window.getSelection();
                    const range = sel.getRangeAt(0);
                    const firstLine = range.startContainer;
                    const lastLine = range.endContainer;
                    const firstLineIndex = range.startOffset + currentLines[0].innerText.length - firstLine.length;
                    const lastLineIndex = range.endOffset + currentLines[currentLines.length-1].innerText.length - lastLine.length;

                        let lastLineText = currentLines[currentLines.length-1].getAttribute('data-text').slice(lastLineIndex)

                        currentLines.slice(1).forEach(line => {
                            line.remove()
                    });

                    currentLines[0].setAttribute('data-text', currentLines[0].getAttribute('data-text').slice(0, firstLineIndex));
                    this.renderMarkdown(currentLines[0])

                    let newLine = this.createLine(lastLineText)
                        this.renderMarkdown(newLine)
                        currentLines[0].insertAdjacentElement('afterend', newLine);

                    placeCaretAtEnd(newLine.querySelector('.line-contents'))
                    }
                }
                else if ((event.key === 'a' && event.metaKey) || (event.key === 'a' && event.ctrlKey)) {
                    keysPressed['a'] = true
                    if (event.metaKey) {
                        keysPressed['meta'] = true
                    }
                    else {
                        keysPressed['ctrl'] = true
                    }

                    event.preventDefault()
                    document.querySelectorAll('.line').forEach(e => e.classList.add('active-line'))

                    const range = document.createRange();
            range.selectNodeContents(document.getElementById('text'));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
                }
                else if (event.key === 'Tab') {
                    event.preventDefault()
                }
            },
            textPaste(event) {
                let currentLines = findSelectedDivs(document.getElementById('text'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line')).filter( line => line.classList.contains('line'))
                const clipboardData = event.clipboardData || window.clipboardData; // Cross-browser support
                const clipboardText = clipboardData.getData('text/plain');
                const lines = clipboardText.split('\n');

                if (currentLines.length==1) {
                    event.preventDefault()
                        const sel = window.getSelection();
                        const range = sel.getRangeAt(0);
                        const firstLine = range.startContainer;
                        const lastLine = range.endContainer;
                        const firstLineIndex = range.startOffset + currentLines[0].innerText.length - firstLine.length;
                        const lastLineIndex = range.endOffset + currentLines[currentLines.length-1].innerText.length - lastLine.length;

                        let lastLineText = currentLines[currentLines.length-1].getAttribute('data-text').slice(lastLineIndex)
                        currentLines[0].setAttribute('data-text', currentLines[0].getAttribute('data-text').slice(0, firstLineIndex) + lines[0] + lastLineText);
                        this.renderMarkdown(currentLines[0])

                        sel.removeAllRanges();

                        const range1 = setCursorPosition(currentLines[0].querySelector('.line-contents'), document.createRange(), {
                            pos: currentLines[0].getAttribute('data-text').slice(0, firstLineIndex).length+lines[0].length,
                            done: false,
                        });
                        range1.collapse(true);
                        sel.addRange(range1);

                        for (let i=lines.length-1; i>0; i--) {
                            let newLine = this.createLine(lines[i])
                                this.renderMarkdown(newLine)
                                currentLines[0].insertAdjacentElement('afterend', newLine);
                        }
                    }
                    else {
                        event.preventDefault()
                        const sel = window.getSelection();
                        const range = sel.getRangeAt(0);
                        const firstLine = range.startContainer;
                        const lastLine = range.endContainer;
                        const firstLineIndex = range.startOffset + currentLines[0].innerText.length - firstLine.length;
                        const lastLineIndex = range.endOffset + currentLines[currentLines.length-1].innerText.length - lastLine.length;

                        if (lines.length > 1) {
                            currentLines.slice(1, -1).forEach(line => {
                                line.remove()
                            });

                            currentLines[0].setAttribute('data-text', currentLines[0].getAttribute('data-text').slice(0, firstLineIndex) + lines[0]);
                            this.renderMarkdown(currentLines[0])

                            for (let i=lines.length-2; i>0; i--) {
                                let newLine = this.createLine(lines[i])
                                    this.renderMarkdown(newLine)
                                    currentLines[0].insertAdjacentElement('afterend', newLine);
                            }

                            currentLines[currentLines.length-1].setAttribute('data-text', lines[lines.length-1] + currentLines[currentLines.length-1].getAttribute('data-text').slice(lastLineIndex));
                            this.renderMarkdown(currentLines[currentLines.length-1])

                            sel.removeAllRanges();
                            
                            const range1 = setCursorPosition(currentLines[0].querySelector('.line-contents'), document.createRange(), {
                                    pos: firstLineIndex,
                                    done: false,
                                });

                                range1.collapse(true);
                                sel.addRange(range1);
                            }
                            else {
                                let lastLineText = currentLines[currentLines.length-1].getAttribute('data-text').slice(lastLineIndex)
                                currentLines.slice(1).forEach(line => {
                                line.remove()
                            });

                            currentLines[0].setAttribute('data-text', currentLines[0].getAttribute('data-text').slice(0, firstLineIndex) + lines[0] + lastLineText);
                            this.renderMarkdown(currentLines[0])

                            placeCaretAtEnd(currentLines[0].querySelector('.line-contents'))
                            }
                    }

            },
            async loadContents() {
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
            },
            saveContents() {
                if (this.file) {
                    var textContent = []
                    var lines = document.querySelectorAll('.line')
                    for (let i=0; i<lines.length; i++) {
                        textContent.push(lines[i].getAttribute('data-text')
                            //.replace('&nbsp;&nbsp;&nbsp;&nbsp;', '\t')
                            .replace(/\n$/, '')
                        )
                    }
                    window.electronAPI.requestSaveFile(this.file, textContent.join('\n'))
                }
            },
            highLightInstance(instance) {
                setTimeout(()=>{
                    let instanceObject = document.getElementById(instance.join('-'))
                    if (instanceObject) {
                        instanceObject.classList.add('active-instance')
                    }
                },200)
            }
        },
        created() {
            EventBus.$on('highLightInstance', this.highLightInstance)
            if (this.file) {
                this.$nextTick(()=> {
                    this.loadContents()
                })
            }
        },
        watch: {
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
                    }
                }
            }
        },
        computed: {
            autocompleteItems() {
                const filteredWords = this.currentGroup.words.filter(word =>
                    word.name.toLowerCase().startsWith(this.autocomplete.word.toLowerCase())
                );

                const filteredConnections = this.currentGroup.connections.filter(connection =>
                    connection.name.toLowerCase().startsWith(this.autocomplete.word.toLowerCase())
                );

                const filteredCategories = this.currentGroup.categories.filter(category =>
                    category.name.toLowerCase().startsWith(this.autocomplete.word.toLowerCase())
                );

                const allFilteredItems = [
                    ...filteredWords,
                    ...filteredConnections,
                    ...filteredCategories
                ];

                return allFilteredItems
            }
        }
    }
</script>