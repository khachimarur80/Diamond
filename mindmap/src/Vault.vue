<template>
<v-app>
  <div id="app-contents">
    <VaultPanel :vaults="vaults" @removeVault="removeVault"></VaultPanel>
    <VaultOptions :vaults="vaults" @addVault="addVault"></VaultOptions>
  </div>
</v-app>
</template>

<script>

import VaultPanel from './components/VaultPanel';
import VaultOptions from './components/VaultOptions';

export default {
  name: 'VaultWin',

  components: {
    //Panel where list of vaults is displayed
    VaultPanel,
    //Panel where actions you can perform on vaults are displayed
    VaultOptions
  },

  data: () => ({
    vaults: [],
  }),

  methods: {
    //Function from VaultOptions.vue that modifies vaults prop
    addVault(vault) {
      this.vaults.push({name: vault.split('/').slice(-1)[0], id: vault})
      window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
    },
    //Function from VaultPanel.vue that modifies vaults prop
    removeVault(vault) {
      console.log(1)
      this.vaults = this.vaults.filter(e => e!==vault)
      window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
    }
  },

  async created() {
    //Vaults are stored in localStorage
    const vaultsFromLocalStorage = window.localStorage.getItem('vaults');
    let invalidVaults = []

    //If vaults stored
    if (vaultsFromLocalStorage) {
      //Set vaults to stored vaults in localStorage
      this.vaults = JSON.parse(vaultsFromLocalStorage);

      //Iterate through vaults if they havent been moved or deleted
      for (let i=0; i<this.vaults.length; i++) {  
        const message = await new Promise(resolve => {
          window.electronAPI.pathValid(this.vaults[i].id)
          window.electronAPI.response('path-valid-response', resolve)
        });
        if (!message) {
          //Append if yes, because they are invalid
          invalidVaults.push(this.vaults[i])
        }
      }
    }
    //Only remain with valid vaults
    this.vaults = this.vaults.filter(e => !invalidVaults.includes(e))
    //Update stored vaults to remove old invalid ones
    window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
  }
};
</script>

<style>
  body, html {
    margin: 0px;
    height: 100%;
    width: 100%;
    padding: 0px;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  #app-contents {
    height: 100%;
    width: 100%;
    display: flex;
    outline: 1px solid red;
  }
</style>