import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/Customers.vue'
import Products from '@/views/Products.vue'
import Debts from '@/views/Debts.vue'
import Income from '@/views/Income.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/customers', 
    name: 'Customers', 
    component: Customers,
    meta: { requiresAuth: true }
  },
  { 
    path: '/products', 
    name: 'Products', 
    component: Products,
    meta: { requiresAuth: true }
  },
  { 
    path: '/debts', 
    name: 'Debts', 
    component: Debts,
    meta: { requiresAuth: true }
  },
  { 
    path: '/income', 
    name: 'Income', 
    component: Income,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
