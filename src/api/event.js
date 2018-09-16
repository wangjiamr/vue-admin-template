/**
 * Created by Lara Croft on 2018/9/15.
 */
import request from '@/utils/request'
import {postRequest} from '@/utils/request'

const module='event'

export  const editEvent=(data)=>{
  return postRequest( `/${module}/edit`,data)
}

export const enableEvent=(data)=>{
  return postRequest( `/${module}/enable`,data)
}
export const disableEvent=(data)=>{
  return postRequest( `/${module}/disable`,data)
}
export const eventList=(params,module)=>{
  return request({
    url: `/${module}/eventList`,
    method: 'get',
    params
  })
}
export const list=(params)=>{
  return request({
    url: `/${module}/list`,
    method: 'get',
    params
  })
}
export const add=(data)=>{
  return postRequest( `/${module}/add`,data)
}

export const addResult=(data)=>{
  return postRequest( `/${module}/addResult`,data)
}
export const editResult=(data)=>{
  return postRequest( `/${module}/editResult`,data)
}
export const enableResult=(data)=>{
  return postRequest( `/${module}/enableResult`,data)
}
export const disableResult=(data)=>{
  return postRequest( `/${module}/disableResult`,data)
}
export const upResult=(data)=>{
  return postRequest( `/${module}/upResult`,data)
}
export const downResult=(data)=>{
  return postRequest( `/${module}/downResult`,data)
}
export const addEffect=(data)=>{
  return postRequest( `/${module}/addEffect`,data)
}
export const editEffect=(data)=>{
  return postRequest( `/${module}/editEffect`,data)
}
export const deleteEffect=(data)=>{
  return postRequest( `/${module}/deleteEffect`,data)
}
export const setRequire=(data)=>{
  return postRequest( `/${module}/setRequire`,data)
}
export const clearRequire=(data)=>{
  return postRequest( `/${module}/clearRequire`,data)
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
export const getCompare=()=>{
  return request({
    url: `common/getCompare`,
    method: 'get'
  })
}
export const getEventSource=(type)=>{
  return request({
    url: `common/getEventSource/${type}`,
    method: 'get'
  })
}
