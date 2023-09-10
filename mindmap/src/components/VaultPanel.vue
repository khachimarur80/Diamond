<template>
  <div id="vaults">
    <div class="title-bar">
      <div class="default-buttons">
        <button id="close" @click="closeWindow">
          <v-icon size="10px" color="black" class="default-button-icon">
             mdi-close
          </v-icon>
        </button>
        <button id="minimize" @click="minimizeWindow">
            <v-icon size="10px" color="black" class="default-button-icon">
            mdi-minus
            </v-icon>
        </button>
        <button id="expand" disabled>
        </button>
      </div>
    </div>
    <br>
    <v-list flat>
      <v-list-item-group>
        <v-list-item v-for="(vault, i) in vaults" :key="i" color="#628DD0">
          <v-list-item-icon>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-icon>
          <v-list-item-content @mouseup="openVault(vault)">
            <v-list-item-title v-text="vault.name"></v-list-item-title>
            </v-list-item-content>
          <v-list-item-icon >
            <v-btn icon dense @click="removeVault(vault)" small><v-icon >mdi-close</v-icon></v-btn>
          </v-list-item-icon>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
  //Panel where list of vaults is displayed
  export default {
    name: 'VaultPanel',

    props: {
      vaults: {
        type: Array,
        required: true,
      },
    },

    methods: {
      //System function actions for titlebar
      closeWindow() {
        window.electronAPI.closeWindow()
      },
      minimizeWindow() {
        window.electronAPI.minimizeWindow()
      },
      openVault(vault) {
        window.electronAPI.openVault(vault.id)
      },
      //Vault removal function that is passed to parent
      removeVault(vault) {
        this.$emit('removeVault', vault)
      },
    },
  }
</script>

<style scoped>

#vaults {
	height: 100%;
	width: 280px;
	float: left;
	background: rgb(38, 38, 38);
	border-right: 1px solid #333;
}

#options {
	height: 100%;
	width: calc(100% - 280px);
	float: right;
	background: #1e1e1e;
}

#icon {
	height: 40%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	pointer-events: none;
}
#icon img {
	height: 130px;
}
#options-content {
	height: 60%;
	width: 100%;
	padding: 25px;
}

.title-bar {
  height: 40px;
  background-color: rgb(38, 38, 38);
  color: white;
  -webkit-app-region: drag;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.default-buttons {
	height: fit-content;
	position: absolute;
	top: 15px;
	left: 0px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 7px;
	padding-left: 12px;
	padding-right: 12px;
	-webkit-app-region: no-drag;
}
.default-buttons button {
	border: none;
	height: 12px;
	width: 12px;
	border-radius: 50%;
}
.default-button-icon {
	display: none !important;
}
.default-buttons:hover .default-button-icon {
	display: block !important;
}
#close {
	background: rgb(255, 95, 87);
}
#minimize {
	background: rgb(254, 188, 46);
}
#expand {
	background: rgb(69, 69, 69);
}
.theme--dark.v-list {
	background-color: rgb(38, 38, 38) !important;
	margin-left: 20px;
	margin-right: 20px;
}
.v-list-item:hover {
	background-color: rgb(54, 54, 54) !important;
	border-radius: 5px;
}
</style>