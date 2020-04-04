import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import './plugins/element.js'
// 导入字体库
import 'assets/fonts/iconfont.css'
// import axios from 'axios'
// 导入树状插件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)

Vue.config.productionTip = false
// 安装
Vue.use(VueQuillEditor /* { default global options } */)

// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// Vue.prototype.$http = axios

// 定义全局过滤器 dataFormat
Vue.filter('dateFormat', function (originValue) {
  const dt = new Date(originValue * 1000)
  const Y = dt.getFullYear()
  const M = (dt.getMonth() + 1 + '').padStart(2, '0')
  const D = (dt.getDay() + '').padStart(2, '0')
  const h = (dt.getHours() + '').padStart(2, '0')
  const m = (dt.getMinutes() + '').padStart(2, '0')
  const s = (dt.getSeconds() + '').padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
