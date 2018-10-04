import request from '@/utils/request'
import {postRequest} from '@/utils/request'
export const module='luck'

export const getList = (params) => {
  return request({
    url: `/${module}/list`,
    method: 'get',
    params
  })
}

export const add = (data) => {
  return postRequest( `/${module}/add`,data)
}
export const edit = (data) => {
  return postRequest( `/${module}/edit`,data)
}
export const enable = (data) => {
  return postRequest( `/${module}/enable`,data)
}
export const disable = (data) => {
  return postRequest( `/${module}/disable`,data)
}
