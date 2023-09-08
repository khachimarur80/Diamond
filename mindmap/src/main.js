import Vue from 'vue'
import VaultWin from './Vault.vue'
import vuetify from './plugins/vuetify'
import '../node_modules/@mdi/font/css/materialdesignicons.css';
import '../node_modules/vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(VaultWin),
}).$mount('#app')

