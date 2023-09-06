 
import Vue from 'vue'
import MainWin from '../Main.vue'
import vuetify from '../plugins/vuetify'

Vue.config.productionTip = false

new Vue({
    vuetify,
    render: h => h(MainWin, {
    }),
}).$mount('#app')