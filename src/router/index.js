import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('../components/Login')
const Home = () => import('@/views/home/Home')
const Welcome = () => import('@/views/welcome/Welcome')
const Users = () => import('@/views/user/Users')
const Rights = () => import('@/views/right/Rights')
const Roles = () => import('@/views/right/Roles')
const Categories = () => import('@/views/categories/categories')
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
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: () => import('@/views/categories/categoriesParams')
      },
      {
        path: '/goods',
        component: () => import('@/views/categories/categoriesGoods')
      },
      {
        path: '/goods/add',
        component: () => import('@/views/categories/goodsAdd')
      },
      {
        path: '/orders',
        component: () => import('@/views/oders/orders')
      },
      {
        path: '/reports',
        component: () => import('@/views/report/report')
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
