import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
// 导入字体库
import 'assets/fonts/iconfont.css'
import axios from 'axios'
// 导入树状插件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
