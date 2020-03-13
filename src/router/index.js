import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('../components/Login')
const Home = () => import('@/views/home/Home')
const Welcome = () => import('@/views/welcome/Welcome')
const Users = () => import('@/views/Users')
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
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'// 取消url中的#
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') { return next() }
  const tokenSession = window.sessionStorage.getItem('token')
  if (!tokenSession) return next('/login')
  next()
})
export default router
