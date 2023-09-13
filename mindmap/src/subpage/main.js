 
import Vue from 'vue'
import MainWin from '../Main.vue'
import vuetify from '../plugins/vuetify'
//import '../../node_modules/@mdi/font/css/materialdesignicons.css';
//import '../../node_modules/vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false

new Vue({
    vuetify,
    render: h => h(MainWin),
}).$mount('#app')