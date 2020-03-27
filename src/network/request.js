import axios from 'axios'
export function request (config) {
  // 1.创建axios的实例
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    timeout: 5000
  })
  // 2拦截器interceptors                       参数可以自己命名
  instance.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    // 1比如说config中的一些信息不符合服务器的要求，需要进行处理一下
    // 2每次发送网络请求时候，在界面中显示请求图标
    // 3.某些网络请求（比如登录 token）必须携带 一些特殊信息
    return config
  }, err => {
    console.log(err)
  })
  // 响应链接
  instance.interceptors.response.use(res => {
    //  console.log(res);  需要返回
    return res.data
  }, err => {
    console.log(err)
  })
  // 3发送真正的请求
  return instance(config)
}

export function loginRequest (config) {
  // 1.创建axios的实例
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    timeout: 5000
  })
  return instance(config)
}
