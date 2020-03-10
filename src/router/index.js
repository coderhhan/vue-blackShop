import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '@/views/home/Home'
Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') { return next() }
  const tokenSession = window.sessionStorage.getItem('token')
  if (!tokenSession) return next('/login')
  next()
})
export default router
