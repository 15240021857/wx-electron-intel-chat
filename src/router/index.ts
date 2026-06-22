import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/LayoutIndex.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '/', component: () => import('@/components/ChatMain.vue') },
      { path: '/settings', component: () => import('@/components/SettingPage.vue') },
    ],
  },
]
const router = createRouter({
  routes,
  history: createWebHashHistory(),
})
export default router
