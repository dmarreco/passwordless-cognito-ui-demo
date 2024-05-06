import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/magic-link'
    },
    {
      path: '/magic-link',
      name: 'MagicLink',
      component: () => import('../views/MagicLinkView.vue')
    }
  ]
})

export default router
