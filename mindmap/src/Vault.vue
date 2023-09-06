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
    VaultPanel,
    VaultOptions
  },

  data: () => ({
    vaults: [],
  }),

  methods: {
    addVault(vault) {
      this.vaults.push({name: vault.split('/').slice(-1)[0], id: vault})
      window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
    },
    removeVault(vault) {
      console.log(1)
      this.vaults = this.vaults.filter(e => e!==vault)
      window.localStorage.setItem('vaults', JSON.stringify(this.vaults))
    }
  },

  async created() {
    const vaultsFromLocalStorage = window.localStorage.getItem('vaults');
    let invalidVaults = []
    if (vaultsFromLocalStorage) {
      this.vaults = JSON.parse(vaultsFromLocalStorage);
      for (let i=0; i<this.vaults.length; i++) {
        const message = await new Promise(resolve => {
          window.electronAPI.pathValid(this.vaults[i].id)
          window.electronAPI.response('path-valid-response', resolve)
        });
        if (!message) {
          invalidVaults.push(this.vaults[i])
        }
      }
    }
    this.vaults = this.vaults.filter(e => !invalidVaults.includes(e))
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