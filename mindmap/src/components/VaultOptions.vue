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
        <p>Open selected vault</p>
        <p style="font-size: 13px;">Select an existing vault and open it</p>
        </div>
        </div>
        <v-btn :disabled="selectedVault==null" dense width="100" color="#628DD0" @click="openVault">Open</v-btn>
        </div>
        <v-divider></v-divider>
      </div>
  </div>
</template>

<script>
  export default {
    name: 'VaultOptions',

    data: () => ({
      waiting: false,
      newVaultName: null,
      newVaultLocation: null,
      errorMessage: false,
      selectedVault: null,
      createVault: false,
    }),

    methods: { 
      openVault() {
      },
      createVaultFunc() {
      },
      openFileBrowser() {

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