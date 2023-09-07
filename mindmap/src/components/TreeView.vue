<template>
    <div class="treeview-container">
        <div class="tree-node main-node" v-if="vault">
            <div class="node-content">
                <div class="node-content-text">
                <div style="height: 5px; width: 20px;"></div>
                <div class="node-file-name" :id="vault" @dragover="dragOverNode" @dragleave="dragLeaveNode" @drop="dragDropNode"
                >{{ vault.split('/').slice(-1)[0] }}</div>
                </div>
            </div>
        </div>
        <div class="tree-node" v-for="node in items" :key="node.id">
            <div class="node-content">
                <div class="node-indent" v-for="i in node.ancestors" :key="i"></div>
                <div class="node-content-text">
                <div class="node-content-collapse" v-if="node.children.length" :style="{'transform': node.open ? 'rotate(90deg)' : 'none' }" @click="node.open = !node.open">
                    <v-icon color="#4f4f4f" size="20">
                        mdi-chevron-right
                    </v-icon>
                </div>
                <div style="height: 5px; width: 20px;" v-else></div>
                <div @dblclick="editFile" @blur="saveFile" @click="openFile(node)" @contextmenu.prevent="nodeMouseDown"
                    @dragover="dragOverNode" @dragleave="dragLeaveNode" @dragstart="dragStartNode" @drop="dragDropNode"
                    @dragend="dragEndNode" draggable=true class="node-file-name" :id="node.id">{{ node.name }}</div>
                </div>
            </div>
            <treeview :items="node.children" :vault="null" v-if="node.open" class="node"></treeview>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'TreeView',
  
    data: () => ({
    }),

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
        findNodeById(nodes, targetId) {
        for (const node of nodes) {
            if (node.id === targetId) {
            return node;
            } else if (node.children && node.children.length) {
            const foundNode = this.findNodeById(node.children, targetId);
            if (foundNode) {
                return foundNode;
            }
            }
        }
        return null;
        },
        editFile(event) {
            event.target.setAttribute('contenteditable', 'true')
            const range = document.createRange();
        range.selectNodeContents(event.target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        },
        async saveFile(event) {
                event.target.setAttribute('contenteditable', 'false')

                const message = await new Promise(resolve => {
                        window.electronAPI.requestChangeFileName(event.target.id, event.target.innerText)
                        window.electronAPI.response('change-filename-response', resolve)
                    })

                if (message) {
                    var targetNode = this.findNodeById(this.items, event.target.id)
                    this.$emit('saveFileNode', targetNode, message)
                
                    targetNode.name = message.split('/').splice(-1)[0].split('.').slice(0,-1).join(".")
                    targetNode.id = message
                }
                else {
                    event.target.innerText = this.findNodeById(this.items, event.target.id).name
                }
        },
        openFile(node) {
            if (!node.isDirectory) {
                this.$emit('fileopened', node.id);
            }
            if (document.querySelector('.active-node')) {
                document.querySelector('.active-node').classList.remove('active-node')
            }
            event.target.parentElement.parentElement.classList.add('active-node')
        },
        dragStartNode(event) {
            event.target.setAttribute('data-dragging', true)
        },
        dragOverNode(event) {
            event.preventDefault();
            if (event.target.classList.contains('node-file-name') 
                && !event.target.classList.contains('drag-over-node')
                && !event.target.getAttribute('data-dragging')
                ) {
                event.target.classList.add('drag-over-node')
                this.nodeOrigin = this.findNodeById(this.items, document.querySelector("[data-dragging='true']").id)
            }
        },
        dragEndNode(event) {
            event.target.removeAttribute('data-dragging')
        },
        dragLeaveNode(event) {
            event.target.classList.remove('drag-over-node')
        },
        dragDropNode(event) {
            var nodeDestiny = this.findNodeById(this.items, event.target.id)
            if (nodeDestiny) {
                if (nodeDestiny.isDirectory && nodeDestiny!=this.nodeOrigin) {
                    this.$emit('filemove', this.nodeOrigin.id, nodeDestiny.id);
                }
            }
            else {
                this.$emit('filemove', this.nodeOrigin.id, event.target.id);
            }
            event.target.classList.remove('drag-over-node')
            this.nodeOrigin = null
        },
        nodeMouseDown(event) {
            this.$emit('nodeMouseDown', event)
        }
    }

  };
</script>