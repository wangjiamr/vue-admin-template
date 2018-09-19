import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },

  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/job',
    name: 'Example',
    meta: { title: 'Manage', icon: 'example' },
    children: [
      {
        path: 'event/:type/:id/:gender',
        name: 'Event',
        component: () => import('@/views/manage/event'),
        meta: { title: 'Event List', icon: 'tree' },
        hidden:true
      },
      {
        path: 'job',
        name: 'Job',
        component: () => import('@/views/manage/job/index'),
        meta: { title: '工作岗位', icon: 'table' }
      },{
        path: 'couple',
        name: 'Couple',
        component: () => import('@/views/manage/couple/index'),
        meta: { title: '情侣', icon: 'table' }
      },
      {
        path: 'plan',
        name: 'Plan',
        component: () => import('@/views/manage/plan/index'),
        meta: { title: '日常消遣', icon: 'tree' }
      },
      {
        path: 'car',
        name: 'Car',
        component: () => import('@/views/manage/car/index'),
        meta: { title: '座驾', icon: 'table' }
      },
      {
        path: 'house',
        name: 'House',
        component: () => import('@/views/manage/house/index'),
        meta: { title: '房屋', icon: 'tree' }
      },
      {
        path: 'clothes',
        name: 'Clothes',
        component: () => import('@/views/manage/clothes/index'),
        meta: { title: '衣服', icon: 'table' }
      },
      {
        path: 'luxury',
        name: 'Luxury',
        component: () => import('@/views/manage/luxury/index'),
        meta: { title: '奢侈品', icon: 'tree' }
      },
      {
        path: 'femaleEvent',
        name: 'FemaleEvent',
        component: () => import('@/views/manage/event/female'),
        meta: { title: '女性事件', icon: 'eye' }
      },
      {
        path: 'maleEvent',
        name: 'MaleEvent',
        component: () => import('@/views/manage/event/male'),
        meta: { title: '男性事件', icon: 'eye' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
