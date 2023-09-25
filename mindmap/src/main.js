import Vue from 'vue'
import VaultWin from './Vault.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(VaultWin),
}).$mount('#app')
