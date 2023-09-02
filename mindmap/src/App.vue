<template>
<v-app>
  <div id="app-contents">
    <VaultPanel></VaultPanel>
    <VaultOptions></VaultOptions>
  </div>
</v-app>
</template>

<script>

import VaultPanel from './components/VaultPanel';
import VaultOptions from './components/VaultOptions';

export default {
name: 'App',

components: {
  VaultPanel,
  VaultOptions
},

data: () => ({
//
}),
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