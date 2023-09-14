<template>
    <div id="queries">
        <div class="content-wrapper">
            <div id="resizeBarRight">
            </div>
            <div id="queries-content">
                <div id="queries-toolbar" @wheel="scrollQuery">
                    <v-btn-toggle v-model="queryTarget" group>
                        <v-btn icon dense color="green"><v-icon>mdi-code-brackets</v-icon></v-btn>
                        <v-btn icon dense color="blue"><v-icon>mdi-transit-connection-horizontal</v-icon></v-btn>
                        <v-btn icon dense color="red"><v-icon>mdi-pound</v-icon></v-btn>
                    </v-btn-toggle>
                </div>
                <div id="words-display" v-show="queryTarget==0" class="query-display">
                    <div class="query-display-title">
                        <h4>Words</h4>
                        <v-btn icon small @click="newObject"><v-icon>mdi-plus</v-icon></v-btn>
                    </div>
                    <div class="query-display-contents">
                        <div>
                            <div v-for="word in currentGroup.words" :key="word.id" @click="selectedObject=word" :style="{ color: word==selectedObject ? '#43A047' : '#fff' }">
                                {{word.name}}
                            </div>
                        </div>
                    </div>
                </div>
                <div id="connections-display" v-show="queryTarget==1" class="query-display">
                    <div class="query-display-title">
                        <h4>Relations</h4>
                        <v-btn icon small @click="newObject"><v-icon>mdi-plus</v-icon></v-btn>
                    </div>
                    <div class="query-display-contents">
                        <div v-for="connection in currentGroup.connections" :key="connection.id" @click="selectedObject=connection"
                        :style="{ color: connection==selectedObject ? '#1976D2' : '#fff' }">
                            {{connection.name}}
                        </div>
                    </div>
                </div>
                <div id="groups-display" v-show="queryTarget==2" class="query-display">
                    <div class="query-display-title">
                        <h4>Sets</h4>
                        <v-btn icon small @click="newObject"><v-icon>mdi-plus</v-icon></v-btn>
                    </div>
                    <div class="query-display-contents">
                        <div v-for="group in currentGroup.categories" :key="group.id" @click="selectedObject=group" :style="{ color: group==selectedObject ? '#EF5350' : '#fff' }">
                            {{group.name}}
                        </div>
                    </div>
                </div>
            </div>
            <div id="query-selected" v-if="selectedObject">
                <div id="word-query" v-if="selectedObject.objectType=='Word'" class="query">
                    <div class="query-text-field">
                        <v-text-field color="green" id="selectedWordName" v-model="newName" hide-details dense></v-text-field>
                    </div>
                    <div class="query-list">
                        <v-icon color="red">mdi-pound</v-icon>
                        <span v-for="category in selectedObject.categories" :key="category.id">{{ getCategoryById(category).name }}</span>
                    </div>
                    <div class="query-list">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <div v-for="connection in selectedObject.connections"  :key="connection.id" class="relation-table">
                            <span>{{ getConnectionById(connection[0]).name }}</span>
                            <v-icon>mdi-arrow-left-right</v-icon>
                            <span v-if="connection[1]">{{ getWordById(connection[1]).name }}</span>
                        </div>
                    </div>
                    <div class="query-button-group">
                        <v-btn @click="saveWordName" color="success" icon tile :disabled="!canSave">
                            <v-icon>
                                mdi-content-save-check-outline
                            </v-icon>
                        </v-btn>
                        <v-btn @click="openFile" color="primary" icon tile>
                            <v-icon>
                                mdi-open-in-new
                            </v-icon>
                        </v-btn>
                        <v-btn @click="deleteObject" color="error" icon tile>
                            <v-icon>
                                mdi-delete-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div id="connection-query" v-if="selectedObject.objectType=='Connection'" class="query">
                    <div class="query-text-field">
                        <v-text-field color="blue" id="selectedConnectionName" v-model="newName" hide-details dense></v-text-field>
                    </div>
                    <div class="query-list">
                        <v-icon color="green">mdi-code-brackets</v-icon>
                        <div v-for="word in selectedObject.words" :key="word.id" class="relation-table">
                            <span>{{ getWordById(word[0]).name }}</span>
                            <v-icon>mdi-arrow-left-right</v-icon>
                            <span v-if="word[1]">{{ getWordById(word[1]).name }}</span>
                        </div>
                    </div>
                    <div class="query-list">
                        <v-icon color="red">mdi-pound</v-icon>
                        <span v-for="category in selectedObject.categories" :key="category.id">{{ getCategoryById(category).name }}</span>
                    </div>
                    <div class="query-button-group">
                        <v-btn @click="saveConnectionName" color="success" icon tile :disabled="!canSave">
                            <v-icon>
                                mdi-content-save-check-outline
                            </v-icon>
                        </v-btn>
                        <v-btn @click="openFile" color="primary" icon tile>
                            <v-icon>
                                mdi-open-in-new
                            </v-icon>
                        </v-btn>
                        <v-btn @click="deleteObject" color="error" icon tile>
                            <v-icon>
                                mdi-delete-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div id="group-query" v-if="selectedObject.objectType=='Category'" class="query">
                    <div class="query-text-field">
                        <v-text-field color="red" id="selectedCategoryName" v-model="newName" hide-details dense></v-text-field>
                    </div>
                    <div class="query-list">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <span v-for="connection in selectedObject.connections" :key="connection">{{ getConnectionById(connection).name }}</span>
                    </div>
                    <div class="query-list">
                        <v-icon color="green">mdi-code-brackets</v-icon>
                        <span v-for="word in selectedObject.words" :key="word">{{ getWordById(word).name }}</span>
                    </div>
                    <div class="query-button-group">
                        <v-btn @click="saveCategoryName" color="success" icon tile :disabled="!canSave">
                            <v-icon>
                                mdi-content-save-check-outline
                            </v-icon>
                        </v-btn>
                        <v-btn @click="openFile" color="primary" icon tile>
                            <v-icon>
                                mdi-open-in-new
                            </v-icon>
                        </v-btn>
                        <v-btn @click="deleteObject" color="error" icon tile>
                            <v-icon>
                                mdi-delete-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import EventBus from '@/event-bus'

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

    class Category {
        constructor() {
            this.id = Math.floor(Math.random()*100000) 
            this.name = "Category "+this.id
            this.objectType = "Category"
            this.file = ""
            this.words = []
            this.connectionsObj = []
            this.connections = []
        }
    }

    export default {
        name: 'QueryBar',
        data: () => ({
            queryTarget: null,
            selectedObject: null,
            newName: '',
        }),
        props: {
            currentGroup : {
                type: null,
                required: true,
            }
        },
        methods: {
            //Being able to select the queryTarget (word, connection or category) by scrolling
            scrollQuery() {
                if (this.queryTarget!=null) {
                    this.queryTarget = (this.queryTarget+1)%3
                }
                else {
                    this.queryTarget = 0
                }
            },
            //New object creation
            async newObject() {
                //Object type will depend on the queryTarget, wether if it is word, conneciton or category
                if (this.queryTarget==0) {
                    var newWord = new Word()
                    newWord.name = '#'+newWord.id //Temporary name
                    this.selectedObject = newWord

                    //Create file for the new word
                    let message = await new Promise(resolve => {
                        window.electronAPI.requestLoadWord(this.currentGroup.file, newWord.name)
                        window.electronAPI.response('load-word-response', resolve)
                    });

                    newWord.file = message

                    //Send event to Main.vue to update currentGroup/vault
                    EventBus.$emit('pushObjectToCurrentGroup', newWord, this.queryTarget)
                }
                else if (this.queryTarget==1) {
                    var newConnection = new Connection()
                    newConnection.name = '#'+newConnection.id //Temporary name
                    this.selectedObject = newConnection
                    
                    //Create file for the new connection
                    let message = await new Promise(resolve => {
                        window.electronAPI.requestLoadConnection(this.currentGroup.file, newConnection.name)
                        window.electronAPI.response('load-connection-response', resolve)
                    })

                    newConnection.file = message

                    //Send event to Main.vue to update currentGroup/vault
                    EventBus.$emit('pushObjectToCurrentGroup', newConnection, this.queryTarget)
                }
                else if (this.queryTarget==2) {
                    var newCategory = new Category()
                    newCategory.name = '#'+newCategory.id //Temporary name
                    this.selectedObject = newCategory
                    
                    //Create file for the new category
                    let message = await new Promise(resolve => {
                        window.electronAPI.requestLoadCategory(this.currentGroup.file, newCategory.name)
                        window.electronAPI.response('load-category-response', resolve)
                    })

                    newCategory.file = message

                    //Send event to Main.vue to update currentGroup/vault
                    EventBus.$emit('pushObjectToCurrentGroup', newCategory, this.queryTarget)
                }
            },
            //Funcitons to update the objects name
            async saveWordName() {
                var value = this.newName
                console.log(value)
                EventBus.$emit('saveWordName', value)
            },
            async saveConnectionName() {
                var value = this.newName
                EventBus.$emit('saveConnectionName', value)
            },
            async saveCategoryName() {
                var value = document.getElementById('selectedCategoryName').value
                EventBus.$emit('saveConnectionName', value)
            },
            openFile() {
                EventBus.$emit('openFile')
            },
            deleteObject() {
                EventBus.$emit('deleteObject')
                this.selectedObject = null
            },
            setSelectedObject(object) {
                this.selectedObject = object
            }
        },
        mounted() {
            const resizeBarRight = document.querySelector("#resizeBarRight");
            const queries = document.querySelector("#queries");

            resizeBarRight.addEventListener("mousedown", () => {
              document.addEventListener("mousemove", resizeQueries, false);
              document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", resizeQueries, false);
                queries.removeAttribute('user-select')
              }, false);
            });

            function resizeQueries(e) {
              const size = `${window.innerWidth - e.clientX}px`;

              if ((window.innerWidth - e.clientX)<245) {
                queries.style.width = '245px';
              }
              else if (window.innerWidth - e.clientX>600) {
                queries.style.width = '600px';
              }
              else {
                queries.style.width = size;
              }
              queries.setAttribute('user-select', 'none')
            }
        },
        async created () {
            //Funciton that goes from TextEditor.vue to QueryBar to update selected object
            // when clicking on an object loaded in the text
            EventBus.$on('setSelectedObject', this.setSelectedObject)
        },
        watch: {
            selectedObject: {
                handler() {
                    if (this.selectedObject) {
                        //Store temporary name of selected object
                        this.newName = this.selectedObject.name
                    }
                    //Update selected object to Main.vue
                    EventBus.$emit('selectedObject', this.selectedObject)
                }
            },
        },
        computed: {
            //Computed value that checks if there are changes in name of selected object
            //To activate save button
            canSave() {
                if (this.newName!=this.selectedObject.name) {
                    return true
                }
                return false
            },
        }
    }
</script>