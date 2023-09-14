<template>
  <div id="options">
    <div class="title-bar" style="background: #1e1e1e;"></div>
      <div id="icon">
        <img style="margin: 10px" src="../assets/main_icon.png">
        <h1>Diamond</h1>
        <p style="font-size: 13px;">Version 1.0.0</p>
      </div>
      <div id="options-content">
        <v-divider></v-divider>
        <div class="option">
          <div class="option-text">
            <p>Create new vault</p>
            <p style="font-size: 13px;">Create a new MindMap vault</p>
          </div>
          <v-dialog v-model="createVault" width="400">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="#628DD0" dense width="100" v-bind="attrs" v-on="on">Create</v-btn>
            </template>
            <v-card class="pa-5 d-flex justify-center">
              <div  v-if="!waiting">
                <v-card-title v-show="!waiting">
                  New vault
                </v-card-title>
                <v-divider></v-divider><br>
                <v-text-field prepend-inner-icon="mdi-file" label="Choose file name" v-model="newVaultName" clearable ></v-text-field>
                <v-text-field prepend-inner-icon="mdi-folder" v-model="newVaultLocation" v-if="newVaultLocation" readonly></v-text-field><br>
                <div style="display: flex; justify-content: center; margin-top: -20px; margin-bottom: 20px;">
                  <v-btn :color="!newVaultLocation ? '#628DD0 ': '#363636'" @click="openFileBrowser">Select a location</v-btn>
                </div>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <p v-else>&nbsp;</p>
                <v-card-actions>
                  <v-spacer></v-spacer>
                    <v-btn color="error" @click="createVault = false">Cancel</v-btn>
                    <v-btn color="success" @click="createVaultFunc">Create</v-btn>
                </v-card-actions>
              </div>
              <div v-else style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100%; overflow: hidden;">
                <v-progress-circular :size="50" color="error" indeterminate></v-progress-circular>
              </div>
            </v-card>
          </v-dialog>
        </div>
        <v-divider></v-divider>
        <div class="option">
        <div class="option-text">
        <div class="option-text">
        <p>Open folder as vault</p>
        <p style="font-size: 13px;">Select an existing vault and open it</p>
        </div>
        </div>
        <v-btn dense width="100" color="#628DD0" @click="openVault">Open</v-btn>
        </div>
        <v-divider></v-divider>
      </div>
  </div>
</template>

<script>
  //Panel where actions you can perform on vaults are displayed
  export default {
    name: 'VaultOptions',

    data: () => ({
      waiting: false, //Shows progress circular while loading fileBrowser dialog
      newVaultName: null, //Temporary storage of name for newVault creation
      newVaultLocation: null, //Temporary storage of location for newVault creation
      errorMessage: false, //Error message to display when vault creation missing data
      createVault: false, //Flag to show vault creation dialog
    }),

    props: {
      vaults: {
        type: Array,
        required: true,
      },
    },
    
    methods: { 
      async createVaultFunc() {
        if (this.newVaultLocation && this.newVaultName) {
          //Remove dialog for vault creation
          this.createVault = false
          //Vault creation request that returns the new vault path and name
          const message = await new Promise(resolve => {
            window.electronAPI.createNewVault(this.newVaultName, this.newVaultLocation)
            window.electronAPI.response('vault-creation-response', resolve)
          });
          //Update stored vaults in localStorage
          window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
          //Add newly created vault to Vault.vue vaults prop
          this.$emit('addVault', message)
        }
        else {
          //Show error message for invalid input
          this.errorMessage = "Please provide a name and a location.";
          //Remove error message after some time
          setTimeout(()=>{
            this.errorMessage = null
          }, 2000)
        }
      },
      async openVault() {
        //Set progress circular while loading fileBrowser
        this.waiting = true
        const message = await new Promise(resolve => {
          window.electronAPI.openFileBrowser()
          window.electronAPI.response('open-file-browser-response', resolve)
          //Remove progress circular when fileBrowser obtained
          this.waiting = false
        });
        //Add selected directory as vault
        this.$emit('addVault', message)
        //Update stored vaults in localStorage
        window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
      },
      async openFileBrowser() {
        //Set progress circular while loading fileBrowser
        this.waiting = true
        const message = await new Promise(resolve => {
          window.electronAPI.openFileBrowser()
          window.electronAPI.response('open-file-browser-response', resolve)
          //Remove progress circular when fileBrowser obtained
          this.waiting = false
        });
        //Set temporary storage of location for newVault creation
        this.newVaultLocation = message
      },
    },
  }
</script>

<style scoped>

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

.option {
	width: 100%;
	display: flex;
	padding: 10px;
}
.option-text {
	flex: 1;
}
.option-text p {
	margin: 0px !important;
	padding: 0px;
	color: #aaa;
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

#close {
	background: rgb(255, 95, 87);
}
#minimize {
	background: rgb(254, 188, 46);
}
#expand {
	background: rgb(69, 69, 69);
}

.error-message {
	text-align: center;
	color: rgb(255, 82, 82);

}

</style>