import request from '@/utils/request'
import {postRequest} from '@/utils/request'

export const getList = (params) => {
  return request({
    url: '/job/list',
    method: 'get',
    params
  })
}

export const add = (data) => {
  return postRequest( '/job/add',data)
}
export const edit = (data) => {
  return postRequest( '/job/edit',data)
}
export const enable = (data) => {
  return postRequest( '/job/enable',data)
}
export const disable = (data) => {
  return postRequest( '/job/disable',data)
}

export const effectList = (params) => {
  return request({
    url: '/job/effectList',
    method: 'get',
    params
  })
}
export const addEffect = (data) => {
  return postRequest( '/job/addEffect',data)
}
export const editEffect = (data) => {
  return postRequest( '/job/editEffect',data)
}
export const deleteEffect = (data) => {
  return postRequest( '/job/deleteEffect',data)
}


export const requireList = (params) => {
  return request({
    url: '/job/requireList',
    method: 'get',
    params
  })
}
export const addRequire = (data) => {
  return postRequest( '/job/addRequire',data)
}
export const editRequire = (data) => {
  return postRequest( '/job/editRequire',data)
}
export const deleteRequire = (data) => {
  return postRequest( '/job/deleteRequire',data)
}


export  const getOperation=()=>{
  return request({
    url: '/common/getOperation',
    method: 'get'
  })
}
export const getAttr=(type)=>{
  return request({
    url: `common/getAttr/${type}`,
    method: 'get'
  })
}