<template>
    <div id="map-content" v-if="!viewMap">
        <v-btn class="toggleMapView" icon dense @click="toggleMapView">
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
                        <div class="d-flex">
                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn text outlined class="ma-1" v-bind="attrs" v-on="on" @click="addStatement('A')">
                                  <v-icon color="green">mdi-code-brackets</v-icon>
                                </v-btn>
                              </template>
                              <span>Existe concepto</span>
                            </v-tooltip>
                            
                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn text outlined class="ma-1" v-bind="attrs" v-on="on" @click="addStatement('B')">
                                  <v-icon color="red">mdi-pound</v-icon>
                                </v-btn>
                              </template>
                              <span>Existe grupo</span>
                            </v-tooltip>

                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn text outlined class="ma-1" v-bind="attrs" v-on="on" @click="addStatement('C')">
                                  <v-icon color="green">mdi-code-brackets</v-icon>
                                  <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                                  <v-icon color="green">mdi-code-brackets</v-icon>
                                </v-btn>
                              </template>
                              <span>Existe relación</span>
                            </v-tooltip>

                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn text outlined class="ma-1" v-bind="attrs" v-on="on" @click="addStatement('D')">
                                    <v-icon color="red">mdi-pound</v-icon>
                                        <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                                    <v-icon color="green">mdi-code-brackets</v-icon>
                                </v-btn>
                              </template>
                              <span>Grupo relaciona concepto</span>
                            </v-tooltip>

                            <v-tooltip top>
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn text outlined class="ma-1" v-bind="attrs" v-on="on" @click="addStatement('E')">
                                  <v-icon color="red">mdi-pound</v-icon>
                                  <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                                  <v-icon color="red">mdi-pound</v-icon>
                                </v-btn>
                              </template>
                              <span>Grupo relaciona grupo</span>
                            </v-tooltip>
                        </div>
                        <h4>Statements</h4>
                        <div style="width: 100%;">
                            <div style="width: 80%;" v-for="(statement, i) in localFileQuery.statements" :key="i" class="statement">
                                <v-btn icon dense @click="removeStatement(i)" small>
                                    <v-icon>
                                        mdi-close
                                    </v-icon>
                                </v-btn>
                                <input 
                                    v-for="(value, key) in statement.items" 
                                    :key="key" 
                                    :class="key+'-input'" 
                                    v-model="statement.items[key]"
                                    :style="{ width: statement.items[key].length * 14 + 'px' }"
                                >
                            </div>
                        </div>
                        <h4>Actions</h4>
                        <table class="query-list-table">
                            <thead>
                                <tr>
                                    <th>Condition</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(actions, i) in localFileQuery.actions" :key="i">
                                    <td>
                                        <v-text-field
                                            v-model="localFileQuery.actions[i]"
                                            :data-id="i"
                                            outlined 
                                            no-resize 
                                            dense 
                                            hide-details 
                                            @keydown.enter="localFileQuery.actions.push('')"
                                            @keydown.backspace="removeAction(i)"
                                            autofocus
                                        >
                                        </v-text-field>
                                    </td>
                                    <td>
                                        <v-text-field
                                            outlined 
                                            no-resize 
                                            dense 
                                            hide-details 
                                            autofocus
                                        >
                                        </v-text-field>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <h4>Truth table</h4>
                        <div>
                            <table class="query-list-table">
                                <thead>
                                <tr>
                                    <th v-for="(statement, i) in localFileQuery.statements" :key="i">
                                        <span style="margin: 0px 2px 0px 2px;" v-for="(value, key) in statement.items" :key="key">{{ statement.items[key] }}</span>
                                    </th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(num, i) in powerTwo" :key="i">
                                    <td v-for="(val, i) in num" :key="i">
                                        {{ val }}
                                    </td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
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

    class Statement {
        constructor(type) {
            this.type = type
            this.negated = false
            this.items = {}
        }
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
            addStatement(type) {
                if (type==='A') {
                    let statement = new Statement('A')
                    statement.items = {'word' : null}
                    this.localFileQuery.statements.push(statement)
                }
                else if (type==='B') {
                    let statement = new Statement('B')
                    statement.items = {'category' : null}
                    this.localFileQuery.statements.push(statement)
                }
                else if (type==='C') {
                    let statement = new Statement('C')
                    statement.items = {'word1' : null, 'connection' : null, 'word2' : null}
                    this.localFileQuery.statements.push(statement)
                }
                else if (type==='D') {
                    let statement = new Statement('D')
                    statement.items = {'category' : null, 'connection' : null, 'word' : null}
                    this.localFileQuery.statements.push(statement)
                }
                else if (type==='E') {
                    let statement = new Statement('E')
                    statement.items = {'category1' : null, 'connection' : null, 'category2' : null}
                    this.localFileQuery.statements.push(statement)
                }
            },
            toggleMapView() {
                EventBus.$emit('toggleMapView')
            },
            removeAction(i) {
                if (this.localFileQuery.actions.length>1 && this.localFileQuery.actions[i]=='') {
                    this.localFileQuery.actions.splice(i,1)
                    if (i!=0) {
                        document.querySelector("[data-id='"+(i-1)+"']").focus()
                    }
                    else {
                        document.querySelector('[data-id="0"]').focus()
                    }
                }
            },
            removeStatement(i) {
                this.localFileQuery.statements.splice(i,1)
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
            },
            powerTwo() {
                let n = this.localFileQuery.statements.length;
                if (n <= 0) {
                    return [0];
                }

                const max_value = Math.pow(2, n) - 1;
                const bitValues = [];

                for (let i = 0; i <= max_value; i++) {
                    // Convert the integer to a binary string with 'n' bits and add to the array
                    const binaryValue = i.toString(2).padStart(n, '0');
                    bitValues.push(binaryValue);
                }

                return bitValues;
            }
        }
    }
</script>
<style scoped>
    .word1-input, .word2-input, .word-input {
        border: 1px solid  var(--v-success-base);
        outline: none;
        color: white;
        width: auto;
        padding: 0px 5px 0px 5px;
        border-radius: 5px;
    }
    .connection1-input, .connection2-input, .connection-input {
        border: 1px solid var(--v-primary-base);
        outline: none;
        color: white;
        width: fit-content;
        padding: 0px 5px 0px 5px;
        border-radius: 5px;
    }
    .category1-input, .category2-input, .category-input {
        border: 1px solid  var(--v-error-base);
        outline: none;
        color: white;
        width: fit-content;
        padding: 0px 5px 0px 5px;
        border-radius: 5px;
    }
    .statement {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
    }
</style>