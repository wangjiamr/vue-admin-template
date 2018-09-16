import request from '@/utils/request'
import {postRequest} from '@/utils/request'
export const module='luxury'

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
export const effectList = (params) => {
  return request({
    url: `/${module}/effectList`,
    method: 'get',
    params
  })
}
export const addEffect = (data) => {
  return postRequest( `/${module}/addEffect`,data)
}
export const editEffect = (data) => {
  return postRequest( `/${module}/editEffect`,data)
}
export const deleteEffect = (data) => {
  return postRequest( `/${module}/deleteEffect`,data)
}


export const requireList = (params) => {
  return request({
    url: `/${module}/requireList`,
    method: 'get',
    params
  })
}
export const addRequire = (data) => {
  return postRequest(`/${module}/addRequire`,data)
}
export const editRequire = (data) => {
  return postRequest( `/${module}/editRequire`,data)
}
export const deleteRequire = (data) => {
  return postRequest( `/${module}/deleteRequire`,data)
}
export  const getOperation=()=>{
  return request({
    url: `/common/getOperation`,
    method: 'get'
  })
}
export const getAttr=(type)=>{
  return request({
    url: `common/getAttr/${type}`,
    method: 'get'
  })
}

export  const addEvent=(data)=>{
  return postRequest( `/${module}/addEvent`,data)
}
export const eventList = (params) => {
  return request({
    url: `/${module}/eventList`,
    method: 'get',
    params
  })
}