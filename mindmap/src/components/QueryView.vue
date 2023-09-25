<template>
    <div id="map-content" v-if="!viewMap">
        <v-btn class="toggleMapView mt-2 mr-2" icon dense @click="toggleMapView">
            <v-icon>
                mdi-file-tree-outline
            </v-icon>
        </v-btn>
        <div id="query" v-show="mapViewMode=='query'">
            <div class="query-content" v-if="localFileQuery.objectType=='Word'">
                <h2>{{ localFileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="red">mdi-pound</v-icon>
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedCategory" color="red" :items="currentGroup.categories" item-text="name" item-value="id" auto-select-first></v-autocomplete>
                        </div>
                        <v-btn outlined color="red" @click="addCategory">Add</v-btn>
                    </div>

                    <div v-for="(category, i) in localFileQuery.categories" :key="i" class="query-list-item">
                        <span @click="openFile(getCategoryById(category).file)" class="category-link">{{ category }}</span>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeCategory(category)">
                            <v-icon color="red">
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <h3>Connections</h3>
                    </div>
                    <div v-for="(connection, i) in localFileQuery.connections" :key="i" class="query-list-row">
                        <div class="query-list-item-column">
                            <span @click="openFile(getCategoryById(connection.component1).file)" class="category-link" v-if="getCategoryById(connection.component1)">{{ getCategoryById(connection.component1).name }}</span>
                            <span @click="openFile(getWordById(connection.component1).file)" class="word-link" v-else>{{ getWordById(connection.component1).name }}</span>
                        </div>
                        <v-icon v-if="connection.directionality=='l'">mdi-arrow-left-bold</v-icon>
                        <v-icon v-if="connection.directionality=='r'">mdi-arrow-right-bold</v-icon>
                        <v-icon v-else>mdi-arrow-left-right</v-icon>
                        <div class="query-list-item-column">
                            <span @click="openFile(getCategoryById(connection.component2).file)" class="category-link" v-if="getCategoryById(connection.component2)">{{ getCategoryById(connection.component2).name }}</span>
                            <span @click="openFile(getWordById(connection.component2).file)" class="word-link" v-else>{{ getWordById(connection.component2).name }}</span>
                        </div>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeConnection(connection)">
                            <v-icon color="green">
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="green">mdi-code-brackets</v-icon>
                        <h3>Instances</h3>
                    </div>
                        <div class="instances">
                        <div v-for="(instanceList, key) in localFileQuery.instances" :key="key" class="instance-container">
                            <h4 style="text-align: center;">{{ key }}</h4>
                            <div class="table-container">
                            <table class="query-list-table">
                                <colgroup>
                                <col>
                                <col>
                                <col>
                                <col>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>Line</th>
                                    <th>Index</th>
                                    <th>Position</th>
                                    <th>View</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(item, i) in instanceList" :key="i">
                                    <td>{{ item[2] }}</td>
                                    <td>{{ item[3] }}</td>
                                    <td>{{ item[4] }}</td>
                                    <td><v-btn dense icon x-small @click="viewInstance(item)"><v-icon>mdi-open-in-new</v-icon></v-btn></td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                        </div>
                </div>
            </div>
            <div class="query-content" v-if="localFileQuery.objectType=='Connection'">
                <h2>{{ localFileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon>mdi-cog-outline</v-icon>
                        <h3>Attributes</h3>
                    </div>
                    <div  class="query-list-row" style="flex-direction: column;">
                        <h4>Directionality</h4>
                        <div>
                            <v-select :items="directionality" item-value="value" color="white" v-model="localFileQuery.directionality" class="directionality" dense>
                                <template v-slot:selection="{ item }">
                                    <v-icon size="item.size">{{ item.icon }}</v-icon>
                                </template>
                                <template v-slot:item="{ item }">
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <v-icon :size="item.size">{{ item.icon }}</v-icon>
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </template>
                            </v-select>
                        </div>

                    </div>
                    <div  class="query-list-row" style="flex-direction: column;">
                        <h3>Function</h3>
                        <h4>Outputs</h4>
                        <div class="d-flex">
                           <v-btn icon dense tile color="success" outlined class="ml-2 mr-2"> 
                                <v-tooltip top>
                                  <template v-slot:activator="{ on }">
                                    <v-icon v-on="on">
                                      mdi-code-tags
                                    </v-icon>
                                  </template>
                                  New Line
                                </v-tooltip>
                            </v-btn>
                           <v-btn icon dense tile outlined class="ml-2 mr-2" color="amber">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on">
                                            mdi-minus
                                        </v-icon>
                                    </template>
                                  Substraction
                                </v-tooltip>
                           </v-btn>
                           <v-btn icon tile dense outlined class="ml-2 mr-2" color="lime">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on">
                                            mdi-plus
                                        </v-icon>
                                    </template>
                                  Addition
                                </v-tooltip>
                           </v-btn>
                           <v-btn icon tile dense color="blue" outlined class="ml-2 mr-2">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on">
                                            mdi-transit-connection-horizontal
                                        </v-icon>
                                    </template>
                                  Add Relation
                                </v-tooltip>
                           </v-btn>
                           <v-btn icon tile dense color="green" outlined class="ml-2 mr-2">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on">
                                            mdi-code-brackets
                                        </v-icon>
                                    </template>
                                  Add Word
                                </v-tooltip>
                           </v-btn>
                           <v-btn icon tile dense color="red" outlined class="ml-2 mr-2">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on">
                                            mdi-pound
                                        </v-icon>
                                    </template>
                                  Add Sett
                                </v-tooltip>
                           </v-btn>
                        </div>
                        <div style="width: 80%;" v-for="(output, i) in localFileQuery.outputs" :key="i">
                            <v-text-field
                                v-model="localFileQuery.outputs[i]"
                                :data-id="i"
                                outlined 
                                no-resize 
                                dense 
                                hide-details 
                                @keydown.enter="localFileQuery.outputs.push('')"
                                @keydown.backspace="removeOutput(i)"
                                autofocus
                            >
                            </v-text-field>
                        </div>
                        <br>
                        <p>Test Run</p>
                        <div class="d-flex justify-center align-center" style="width: 80%;">
                            <v-text-field v-model="testFunction" dense outlined hide-details>
                            </v-text-field>
                            <v-btn color="warning" outlined @click="runFunction" class="ml-3">
                                Run
                            </v-btn>
                        </div>
                        <br>
                    </div>
                </div>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="red">mdi-pound</v-icon>
                        <h4>Sets</h4>
                    </div>
                    <div class="query-list-heading">
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedCategory" color="red" :items="currentGroup.categories" item-text="name" item-value="id" auto-select-first clearable></v-autocomplete>
                        </div>
                        <v-btn outlined color="red" @click="addCategory">Add</v-btn>
                    </div>
                    <div v-for="(category, i) in localFileQuery.categories" :key="i" class="query-list-item">
                        <span @click="openFile(getCategoryById(category).file)" class="category-link">{{ getCategoryById(category).name }}</span>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeCategory(category)">
                            <v-icon color="red">
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div class="query-list" style="border-top: 1px solid #363636">
                    <div class="query-list-heading">
                        <h4>Connections</h4>
                    </div>
                    <div class="query-list-heading">
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedWordConnection" color="green" :items="currentGroup.words" item-text="name" item-value="id" auto-select-first clearable></v-autocomplete>
                        </div>
                        <v-btn outlined color="green" @click="addComponentConnection">Add</v-btn>
                    </div>
                    <div class="query-list-heading">
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedCategoryConnection" color="red" :items="currentGroup.categories" item-text="name" item-value="id" auto-select-first clearable></v-autocomplete>
                        </div>
                        <v-btn outlined color="red" @click="addComponentConnection">Add</v-btn>
                    </div>
                    <div v-if="generatingConnection" class="query-list-row">
                        <div class="query-list-item-column">
                            <span v-if="generatingConnection.component1">{{ generatingConnection.component1.name }}</span>
                        </div>
                        <div class="query-list-item-column">
                            <v-select :items="directionality" item-value="value" color="white" v-model=" generatingConnection.directionality" class="directionality">
                                <template v-slot:selection="{ item }">
                                    <v-icon size="item.size">{{ item.icon }}</v-icon>
                                </template>
                                <template v-slot:item="{ item }">
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <v-icon :size="item.size">{{ item.icon }}</v-icon>
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </template>
                            </v-select>
                        </div>
                        <div class="query-list-item-column">
                            <span v-if="generatingConnection.component2">{{ generatingConnection.component2.name }}</span>
                        </div>
                    </div>
                    <div v-for="(connection, i) in localFileQuery.connections" :key="i" class="query-list-row">
                        <div class="query-list-item-column">
                            <span @click="openFile(getCategoryById(connection.component1).file)" class="category-link" v-if="getCategoryById(connection.component1)">{{ getCategoryById(connection.component1).name }}</span>
                            <span @click="openFile(getWordById(connection.component1).file)" class="word-link" v-else>{{ getWordById(connection.component1).name }}</span>
                        </div>
                        <v-icon v-if="connection.directionality=='l'">mdi-arrow-left-bold</v-icon>
                        <v-icon v-if="connection.directionality=='r'">mdi-arrow-right-bold</v-icon>
                        <v-icon v-else>mdi-arrow-left-right</v-icon>
                        <div class="query-list-item-column">
                            <span @click="openFile(getCategoryById(connection.component2).file)" class="category-link" v-if="getCategoryById(connection.component2)">{{ getCategoryById(connection.component2).name }}</span>
                            <span @click="openFile(getWordById(connection.component2).file)" class="word-link" v-else>{{ getWordById(connection.component2).name }}</span>
                        </div>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeConnection(connection)">
                            <v-icon color="green">
                                mdi-close
                            </v-icon>
                        </v-btn>	
                    </div>
                </div>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <h3>Instances</h3>
                    </div>
                        <div class="instances">
                        <div v-for="(instanceList, key) in localFileQuery.instances" :key="key" class="instance-container">
                            <h4 style="text-align: center;">{{ key }}</h4>
                            <div class="table-container">
                            <table class="query-list-table">
                                <colgroup>
                                <col>
                                <col>
                                <col>
                                <col>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>Line</th>
                                    <th>Index</th>
                                    <th>Position</th>
                                    <th>View</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(item, i) in instanceList" :key="i">
                                    <td>{{ item[2] }}</td>
                                    <td>{{ item[3] }}</td>
                                    <td>{{ item[4] }}</td>
                                    <td><v-btn dense icon x-small @click="viewInstance(item)"><v-icon>mdi-open-in-new</v-icon></v-btn></td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                        </div>
                </div>
            </div>
            <div class="query-content" v-if="localFileQuery.objectType=='Category'">
                <h2>{{ localFileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="green">mdi-code-brackets</v-icon>
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedWord" color="green" :items="currentGroup.words" item-text="name" item-value="id" auto-select-first></v-autocomplete>
                        </div>
                        <v-btn outlined color="green" @click="addWord">Add</v-btn>
                    </div>

                    <div v-for="(word, i) in localFileQuery.words" class="query-list-item" :key="i">
                        <span @click="openFile(getWordById(word).file)">{{ getWordById(word).name }}</span>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeWord(word)">
                            <v-icon color="green">
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedConnection" color="blue" :items="currentGroup.connections" item-text="name" item-value="id" auto-select-first></v-autocomplete>
                        </div>
                        <v-btn outlined color="blue" @click="addConnection">Add</v-btn>
                    </div>
                    <div v-for="(connection, i) in localFileQuery.connectionsObj" :key="i" class="query-list-item">
                        <span @click="openFile(getConnectionById(connection).file)">{{ getConnectionById(connection).name }}</span>
                        <v-btn icon class="delete-query-list-item" dense small @click="removeCategory(connection)">
                            <v-icon color="blue">
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    //Vue instance used for comunication between vue components in the app
    import EventBus from '../event-bus.js';

    function replaceVarFunc(inputString, replacementArray) {
      return inputString.replace(/\$(\d+)/g, function(match, captureGroup) {
        const index = parseInt(captureGroup, 10) - 1;
        if (index >= 0 && index < replacementArray.length) {
          return replacementArray[index];
        }
        else {
          return match;
        }
      });
    }

    export default {
        name: 'QueryView',
        data: () => ({
            mapViewMode : 'query',
            localFileQuery: [],
            selectedCategory: null,
            selectedWord: null,
            selectedConnection: null,
            selectedWordConnection: null,
            selectedCategoryConnection: null,
            generatingConnection: null,
            directionality: [
                {value: 'lr', icon: 'mdi-arrow-left-right-bold'}, 
                {value: 'l', icon: 'mdi-arrow-left-bold', size: 19 },
                {value: 'r', icon: 'mdi-arrow-right-bold', size: 19 },
            ],
            testFunction: 'comer(comida, pan, kei, cagar)',
        }),
        props: {
            fileQuery: {
                required: true,
            },
            currentGroup: {
                required: true,
            },
            viewMap: {
                required: true,
            }
        },
        methods: {
            toggleMapView() {
                EventBus.$emit('toggleMapView')
            },
            runFunction() {
                //comer(comida, pan, kei, cagar)
                let functionName = this.testFunction.split('(')[0]
                let vars = this.testFunction.split('(')[1].slice(0,-1).split(',').map(word => word.trim());

                let functionObj

                for (let i=0; i<this.currentGroup.connections.length; i++) {
                    if (this.currentGroup.connections[i].name == functionName) {
                        functionObj = this.currentGroup.connections[i]
                        break
                    }
                }

                if (functionObj) {
                    for (let i=0; i<functionObj.outputs.length; i++) {
                        let code = replaceVarFunc(functionObj.outputs[i], vars)
                        console.log(code)
                        //Tag addition
                        //When code line contains a '+'
                        if (code.includes(' + ')) {
                            console.log('Tag addition!')
                            let tagWeAdd = code.split(' + ')[0].slice(1)
                            let tagWeAddObject
                            for (let i=0; i<this.currentGroup.categories.length; i++) {
                                if (this.currentGroup.categories[i].name == tagWeAdd) {
                                    tagWeAddObject = this.currentGroup.categories[i]
                                    break
                                }
                            }

                            let objectWeAddToTag = code.split(' + ')[1]
                            let objectWeAddToTagObject
                            if (objectWeAddToTag.includes('#')) {
                                for (let i=0; i<this.currentGroup.categories.length; i++) {
                                    if (this.currentGroup.categories[i].name == objectWeAddToTag.slice(1,-1)) {
                                        objectWeAddToTagObject = this.currentGroup.categories[i]
                                        break
                                    }
                                }
                            }
                            else {
                                for (let i=0; i<this.currentGroup.words.length; i++) {
                                    if (this.currentGroup.words[i].name == objectWeAddToTag.slice(1,-1)) {
                                        objectWeAddToTagObject = this.currentGroup.words[i]
                                        break
                                    }
                                }
                            }
                            if (!tagWeAddObject.words.includes(objectWeAddToTagObject.id)) {
                                tagWeAddObject.words.push(objectWeAddToTagObject.id)
                                objectWeAddToTagObject.categories.push(tagWeAddObject)
                            }
                        }
                        //Tag substraction
                        //When code line contains a '-'
                        else if (code.includes(' - ')) {
                            console.log('Tag substraction!')
                            let tagWeAdd = code.split(' - ')[0].slice(1)
                            let tagWeAddObject
                            for (let i=0; i<this.currentGroup.categories.length; i++) {
                                if (this.currentGroup.categories[i].name == tagWeAdd) {
                                    tagWeAddObject = this.currentGroup.categories[i]
                                    break
                                }
                            }

                            let objectWeAddToTag = code.split(' - ')[1]
                            let objectWeAddToTagObject
                            if (objectWeAddToTag.includes('#')) {
                                for (let i=0; i<this.currentGroup.categories.length; i++) {
                                    if (this.currentGroup.categories[i].name == objectWeAddToTag.slice(1,-1)) {
                                        objectWeAddToTagObject = this.currentGroup.categories[i]
                                        break
                                    }
                                }
                            }
                            else {
                                for (let i=0; i<this.currentGroup.words.length; i++) {
                                    if (this.currentGroup.words[i].name == objectWeAddToTag.slice(1,-1)) {
                                        objectWeAddToTagObject = this.currentGroup.words[i]
                                        break
                                    }
                                }
                            }
                            if (tagWeAddObject.words.includes(objectWeAddToTagObject.id)) {
                                tagWeAddObject.words = tagWeAddObject.words.filter(word => word!= objectWeAddToTagObject.id)
                                objectWeAddToTagObject.categories = objectWeAddToTagObject.categories.filter(category => category.id!=tagWeAddObject.id)
                            }
                        }
                        //Create a connection
                        else {
                            console.log('Connection creation!')
                            let objects = code.split(' ')
                            let word1 = objects[0].slice(1,-1)
                            let word2 = objects[2].slice(1,-1)
                            let connection = objects[1].slice(1,-1)
                            for (let i=0; i<this.currentGroup.words.length; i++) {
                                if (this.currentGroup.words[i].name==word1) {
                                    word1 = this.currentGroup.words[i]
                                    break
                                }
                            }
                            for (let i=0; i<this.currentGroup.words.length; i++) {
                                if (this.currentGroup.words[i].name==word2) {
                                    word2 = this.currentGroup.words[i]
                                    break
                                }
                            }
                            for (let i=0; i<this.currentGroup.connections.length; i++) {
                                if (this.currentGroup.connections[i].name==connection) {
                                    connection = this.currentGroup.connections[i]
                                    break
                                }
                            }
                            if (word1 && word2 && connection) {
                                var parsedConnection = {
                                    directionality: 'lr',
                                    component1: word1.id,
                                    component2: word2.id,
                                    connection: connection.id,
                                }
                                EventBus.$emit('pushParsedConnection', connection, parsedConnection)
                                EventBus.$emit('pushParsedConnection', word1, parsedConnection)
                                EventBus.$emit('pushParsedConnection', word2, parsedConnection)
                            }
                        }
                    }
                }
                else {
                    alert('No such function: '+functionName)
                }
            },
            removeOutput(i) {
                if (this.localFileQuery.outputs.length>1 && this.localFileQuery.outputs[i]=='') {
                    this.localFileQuery.outputs.splice(i,1)
                    if (i!=0) {
                        document.querySelector("[data-id='"+(i-1)+"']").focus()
                    }
                    else {
                        document.querySelector('[data-id="0"]').focus()
                    }
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
            openFile(file) {
                EventBus.$emit('openFile', file)
            },
            addCategory() {
            if (this.selectedCategory) {
                if (this.localFileQuery.objectType == 'Connection') {
                    this.getCategoryById(this.selectedCategory).connectionsObj.push(this.localFileQuery.id)
                    this.localFileQuery.categories.push(this.selectedCategory)
                }
                else if (this.localFileQuery.objectType == 'Word') {
                    this.getCategoryById(this.selectedCategory).words.push(this.localFileQuery.id)
                    this.localFileQuery.categories.push(this.selectedCategory)
                }
                this.selectedCategory = null
            }
            },
            addWord() {
                this.getWordById(this.selectedWord).categories.push(this.localFileQuery.id)
                this.localFileQuery.words.push(this.selectedWord)
            
                this.selectedWord = null
            },
            addConnection() {
                this.getConnectionById(this.selectedConnection).categories.push(this.localFileQuery.id)
                this.localFileQuery.connectionsObj.push(this.selectedConnection)
            
                this.selectedConnection = null
            },
            removeCategory(category) {
                if (this.localFileQuery.objectType == 'Connection') {
                    this.localFileQuery.categories = this.localFileQuery.categories.slice(1, this.localFileQuery.categories.indexOf(category))
                    this.getCategoryById(category).connectionsObj = this.getCategoryById(category).connectionsObj.slice(1, this.getCategoryById(category).connectionsObj.indexOf(this.localFileQuery.id)) 
                }
                else if (this.localFileQuery.objectType == 'Word') {
                    this.localFileQuery.categories = this.localFileQuery.categories.slice(1, this.localFileQuery.categories.indexOf(category))
                    this.getCategoryById(category).connectionsObj = this.getCategoryById(category).words.slice(1, this.getCategoryById(category).connectionsObj.indexOf(this.localFileQuery.id))
                }
                else {
                    this.localFileQuery.connectionsObj = this.localFileQuery.connectionsObj.slice(1, this.localFileQuery.connectionsObj.indexOf(category))
                    this.getConnectionById(category).categories = this.getConnectionById(category).categories.slice(1, this.getConnectionById(category).categories.indexOf(this.localFileQuery.id)) 
                }
            },
            removeWord(word) {
                this.localFileQuery.words = this.localFileQuery.words.filter(w => w!=word)
            },
            removeConnection(connection) {
                this.getConnectionById(connection.connection).connections = this.getConnectionById(connection.connection).connections.filter(c => c!=connection)
                if (this.getWordById(connection.component1)) {
                    this.getWordById(connection.component1).connections = this.getWordById(connection.component1).connections.filter(c => c!=connection)
                }
                else {
                    this.getCategoryById(connection.component1).connections = this.getCategoryById(connection.component1).connections.filter(c => c!=connection)
                }
                if (this.getWordById(connection.component2)) {
                    this.getWordById(connection.component2).connections = this.getWordById(connection.component2).connections.filter(c => c!=connection)
                }
                else {
                    this.getCategoryById(connection.component2).connections = this.getCategoryById(connection.component2).connections.filter(c => c!=connection)
                }
            },
            addComponentConnection() {
                if (!this.generatingConnection) {
                    this.generatingConnection = {
                        directionality: this.localFileQuery.directionality,
                        component1: null,
                        component2: null,
                    }
                }
                if (!this.generatingConnection.component1) {
                    if (this.selectedWordConnection) {
                        this.generatingConnection.component1 = this.getWordById(this.selectedWordConnection)
                        this.selectedWordConnection = null
                    }
                    else if (this.selectedCategoryConnection) {
                        this.generatingConnection.component1 = this.getCategoryById(this.selectedCategoryConnection)
                        this.selectedCategoryConnection = null
                    }
                }
                else if (!this.generatingConnection.component2) {
                    if (this.selectedWordConnection) {
                        this.generatingConnection.component2 = this.getWordById(this.selectedWordConnection)
                        this.selectedWordConnection = null
                    }
                    else if (this.selectedCategoryConnection) {
                        this.generatingConnection.component2 = this.getCategoryById(this.selectedCategoryConnection)
                        this.selectedCategoryConnection = null
                    }
                    var parsedConnection = {
                        directionality: this.generatingConnection.directionality,
                        component1: this.generatingConnection.component1.id,
                        component2: this.generatingConnection.component2.id,
                        connection: this.localFileQuery.id,
                    }
                    this.localFileQuery.connections.push(parsedConnection)
                    this.generatingConnection.component1.connections.push(parsedConnection)
                    this.generatingConnection.component2.connections.push(parsedConnection)
                    this.generatingConnection = null
                }
            },
            evaluate(connection) {
                console.log(connection)
            },
            viewInstance(instance) {
                EventBus.$emit('setFile', [instance[1]])
                EventBus.$emit('highLightInstance', instance)
            },
        },
        async created() {
            this.localFileQuery = this.fileQuery
        },
        computed: {
            combinedItems() {
                return [...this.currentGroup.words, ...this.currentGroup.categories];
            }
        }
    }
</script>