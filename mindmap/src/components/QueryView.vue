<template>
    <div id="map-content">
        <div id="query" v-show="mapViewMode=='query'">
            <div class="query-content" v-if="fileQuery.objectType=='Word'">
                <h2>{{ fileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="red">mdi-pound</v-icon>
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedCategory" color="red" :items="currentGroup.categories" item-text="name" item-value="id" auto-select-first></v-autocomplete>
                        </div>
                        <v-btn outlined color="red" @click="addCategory">Add</v-btn>
                    </div>

                    <div v-for="category in fileQuery.categories" :key="category" class="query-list-item">
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
                    <div v-for="connection in fileQuery.connections" :key="connection" class="query-list-row">
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
                        <div v-for="(instanceList, key) in fileQuery.instances" :key="key" class="instance-container">
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
                                <tr v-for="item in instanceList" :key="item">
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
            <div class="query-content" v-if="fileQuery.objectType=='Connection'">
                <h2>{{ fileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon>mdi-cog-outline</v-icon>
                        <h3>Attributes</h3>
                    </div>
                    <div  class="query-list-row" style="flex-direction: column;">
                        <h4>Directionality</h4>
                        <div>
                            <v-select :items="directionality" item-value="value" color="white" v-model="fileQuery.directionality" class="directionality" dense>
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
                        <h4>Function</h4>
                        <v-btn v-if="!fileQuery.upgraded" @click="fileQuery.upgraded = true" color="blue" outlined dense>
                            Upgrade
                        </v-btn>
                        <v-btn v-if="!fileQuery.upgraded" color="warning" outlined dense @click="evaluate(fileQuery)">
                            Evaluate
                        </v-btn>
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
                    <div v-for="category in fileQuery.categories" :key="category" class="query-list-item">
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
                    <div v-for="connection in fileQuery.connections" :key="connection" class="query-list-row">
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
                        <div v-for="(instanceList, key) in fileQuery.instances" :key="key" class="instance-container">
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
                                <tr v-for="item in instanceList" :key="item">
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
            <div class="query-content" v-if="fileQuery.objectType=='Category'">
                <h2>{{ fileQuery.name }}</h2>
                <div class="query-list">
                    <div class="query-list-heading">
                        <v-icon color="green">mdi-code-brackets</v-icon>
                        <div class="autocomplete-container">
                            <v-autocomplete v-model="selectedWord" color="green" :items="currentGroup.words" item-text="name" item-value="id" auto-select-first></v-autocomplete>
                        </div>
                        <v-btn outlined color="green" @click="addWord">Add</v-btn>
                    </div>

                    <div v-for="word in fileQuery.words" class="query-list-item" :key="word">
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
                    <div v-for="connection in fileQuery.connectionsObj" :key="connection" class="query-list-item">
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
    export default {
        name: 'QueryView',
        data: () => ({
            mapViewMode : 'query',
            fileQuery: [],
        }),
        props: {},
        methods: {},
    }
</script>