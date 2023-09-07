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
                            <div v-for="word in currentGroup.words" :key="word" @click="selectedObject=word" :style="{ color: word==selectedObject ? '#43A047' : '#fff' }">
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
                        <div v-for="connection in currentGroup.connections" :key="connection" @click="selectedObject=connection"
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
                        <div v-for="group in currentGroup.categories" :key="group" @click="selectedObject=group" :style="{ color: group==selectedObject ? '#EF5350' : '#fff' }">
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
                        <span v-for="category in selectedObject.categories" :key="category">{{ getCategoryById(category).name }}</span>
                    </div>
                    <div class="query-list">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <div v-for="connection in selectedObject.connections"  :key="connection" class="relation-table">
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
                        <div v-for="word in selectedObject.words" :key="word" class="relation-table">
                            <span>{{ getWordById(word[0]).name }}</span>
                            <v-icon>mdi-arrow-left-right</v-icon>
                            <span v-if="word[1]">{{ getWordById(word[1]).name }}</span>
                        </div>
                    </div>
                    <div class="query-list">
                        <v-icon color="red">mdi-pound</v-icon>
                        <span v-for="category in selectedObject.categories" :key="category">{{ getCategoryById(category).name }}</span>
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
    export default {
        name: 'QueryBar',
        data: () => ({
            queryTarget: null,
            selectedObject: null,
        }),
        props: {
            currentGroup : {
                type: null,
                required: true,
            }
        },
        methods: {
            scrollQuery() {

            },
            newObject() {

            },
        },
        async created () {
        }
    }
</script>