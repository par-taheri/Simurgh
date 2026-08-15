import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/admin/news'
  },
  {
    path: '/admin/:resource',
    name: 'admin-resource',
    component: () => import('../App.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated && to.path !== '/login') {
    // Session is handled dynamically in App.vue or redirect to login
  }
  next();
});

export default router;
