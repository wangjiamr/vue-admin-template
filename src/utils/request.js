import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000 ,// 请求超时时间
  withCredentials: true
})

axios.defaults.headers.post['Content-Type'] = 'application/json';


// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    if (response && response.config.method === 'post') {
     // refreshToken()
    }
    if (response.data.errorCode >= 400) {
      return Promise.reject({
        response: {
          status: response.data.errorCode
        }
      })
    }
    return response
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)


const postByAxios = (url, params)=> {
  var urlSearchParams = new URLSearchParams()
  if (params) {
    for (var key in params) {
      urlSearchParams.append(key, params[key + '']);
    }
  }
  return service.post(url, urlSearchParams,{
    headers:{
      Authorization:store.getters.getPostToken
    }
  })
}
export const postRequest = (url, params) => {
  if(self.URLSearchParams){
    return postByAxios(url, params)
  }else{
    return  new Promise(function(resolve,reject){

      let paramsStr=''
      if (params) {
        for (var key in params) {
          paramsStr+='&'+key+'='+params[key + '']
        }
        paramsStr=paramsStr.substring(1)
      }
      var client = new XMLHttpRequest();
      client.open("POST", base_url+url, true)
      client.withCredentials = true
      client.onreadystatechange = handler
      client.setRequestHeader("Accept", "application/json, text/plain, */*")
      client.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
      client.setRequestHeader("Authorization",store.getters.getPostToken)
      client.send(paramsStr)
      // console.info('Post from fucking IE')

      function handler() {
        if (this.readyState !== 4) {
          return
        }
        if (this.status === 200) {
          //refreshToken()
          const data = JSON.parse(this.response)
          if (data && data['errorCode'] >= 400) {
            reject({
              response: {
                status: data['errorCode']
              }
            })
          } else {
            resolve({data: data})
          }
        } else {
          reject(this.response)
        }
      }
    });
  }
}

export default service
