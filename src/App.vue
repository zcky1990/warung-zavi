<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Store, 
  LayoutDashboard, 
  Users, 
  Package, 
  Receipt, 
  Wallet, 
  LogOut, 
  RefreshCw,
  Bell,
  Search
} from 'lucide-vue-next'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

const router = useRouter()
const route = useRoute()

const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')
const loading = ref(false)
const isSyncing = ref(false)
const toast = ref(null)
const store = ref({
  customers: [],
  products: [],
  debts: [],
  income: []
})

const navItems = [
  { id: 'Dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Customers', path: '/customers', label: 'Buyers', icon: Users },
  { id: 'Products', path: '/products', label: 'Products', icon: Package },
  { id: 'Debts', path: '/debts', label: 'Debts', icon: Receipt },
  { id: 'Income', path: '/income', label: 'Income', icon: Wallet },
]

const activeNavItem = computed(() => {
  return navItems.find(n => n.path === route.path) || navItems[0]
})

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
})

const reloadData = async () => {
  loading.value = true
  store.value = await api.getData()
  loading.value = false
}

const handleAction = async ({ type, payload }) => {
  // 1. Optimistic Update (Immediate UI response)
  const tempId = 'temp-' + Math.random().toString(36).substr(2, 9)
  const resultData = { id: tempId, date: new Date().toISOString() }
  
  // Non-blocking sync start
  isSyncing.value = true
  
  // Update local state first
  syncLocalState(type, payload, resultData)
  
  // 2. Background Network Call
  try {
    const result = await api.post(type, payload)
    
    if (result.success) {
      showToast(type.replace('_', ' ') + ' successful!')
      // 3. Finalize: Replace tempId with real ID from server
      finalizeSync(type, tempId, result)
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    showToast('Sync failed: ' + err.message, 'destructive')
    // Rollback: For simplicity, we just trigger a full reload on failure 
    // to ensure user doesn't see corrupted/unreliable data
    await reloadData()
  } finally {
    isSyncing.value = false
  }
}

const syncLocalState = (type, payload, result) => {
  switch (type) {
    case 'add_customer':
      store.value.customers.push({ 
        id: result.id, 
        name: payload.name, 
        phone: payload.phone, 
        address: payload.address 
      })
      break
    case 'update_customer':
      const customer = store.value.customers.find(c => c.id === payload.id)
      if (customer) Object.assign(customer, payload)
      break
    case 'add_product':
      store.value.products.push({ 
        id: result.id, 
        name: payload.name, 
        price: payload.price, 
        category: payload.category 
      })
      break
    case 'update_product':
      const product = store.value.products.find(p => p.id === payload.id)
      if (product) Object.assign(product, payload)
      break
    case 'add_debt':
      store.value.debts.unshift({ 
        id: result.id, 
        customerid: payload.customerId, 
        date: result.date, 
        items: payload.items, 
        total: payload.total, 
        status: 'unpaid' 
      })
      break
    case 'update_debt':
      const debt = store.value.debts.find(d => d.id === payload.id)
      if (debt) {
          debt.items = payload.items
          debt.total = payload.total
      }
      break
    case 'pay_debt':
      const pDebt = store.value.debts.find(d => d.id === payload.debtId)
      if (pDebt) {
        const paidAmount = parseFloat(payload.amount)
        const currentTotal = parseFloat(pDebt.total)
        
        if (paidAmount < currentTotal) {
          pDebt.total = currentTotal - paidAmount
        } else {
          pDebt.status = 'paid'
        }

        store.value.income.unshift({
          id: result.id,
          date: result.date,
          amount: paidAmount,
          source: 'Debt Payment',
          method: payload.method
        })
      }
      break
    case 'add_direct_income':
      store.value.income.unshift({
        id: result.id,
        date: result.date,
        amount: payload.amount,
        source: payload.source,
        method: payload.method
      })
      break
  }
}

const finalizeSync = (type, tempId, result) => {
  // Replace references with the actual ID from server
  switch (type) {
    case 'add_customer':
      const cIndex = store.value.customers.findIndex(c => c.id === tempId)
      if (cIndex !== -1) store.value.customers[cIndex].id = result.id
      break
    case 'add_product':
      const pIndex = store.value.products.findIndex(p => p.id === tempId)
      if (pIndex !== -1) store.value.products[pIndex].id = result.id
      break
    case 'add_debt':
      const dIndex = store.value.debts.findIndex(d => d.id === tempId)
      if (dIndex !== -1) {
        store.value.debts[dIndex].id = result.id
        store.value.debts[dIndex].date = result.date
      }
      break
    case 'pay_debt':
    case 'add_direct_income':
      const iIndex = store.value.income.findIndex(i => i.id === tempId)
      if (iIndex !== -1) {
        store.value.income[iIndex].id = result.id
        store.value.income[iIndex].date = result.date
      }
      break
  }
}

const showToast = (message, variant = 'default') => {
  toast.value = { message, variant }
  setTimeout(() => toast.value = null, 3000)
}

const logout = () => {
  isLoggedIn.value = false
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

router.afterEach((to) => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
  if (to.name !== 'Login' && store.value.customers.length === 0) {
    reloadData()
  }
})

onMounted(() => {
  if (isLoggedIn.value) reloadData()
})

defineExpose({ handleAction })
</script>

<template>
  <div class="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
    <!-- Public View Layout -->
    <div v-if="route.meta.isPublic" class="flex flex-col min-h-screen">
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-[100] px-6 flex justify-between items-center transition-all duration-300">
        <div class="flex items-center space-x-3">
          <div class="p-1.5 bg-primary text-primary-foreground rounded-lg">
            <Store class="w-5 h-5" />
          </div>
          <h1 class="font-black text-lg tracking-tighter">Warung Zavi</h1>
        </div>
        <router-link to="/login" class="btn-primary h-10 px-5 text-xs font-black uppercase tracking-widest flex items-center shadow-lg hover:scale-105 active:scale-95 transition-all">
          Staff Portal
        </router-link>
      </header>
      <main class="flex-1">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :data="store" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Auth View (No Sidebar) -->
    <div v-else-if="!isLoggedIn" class="min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" :data="store" />
        </transition>
      </router-view>
    </div>

    <!-- Protected View (Sidebar layout) -->
    <div v-else class="flex flex-col md:flex-row min-h-screen">
      <!-- Sidebar (Desktop) -->
      <aside class="hidden md:flex flex-col w-64 bg-card border-r border-border sticky top-0 h-screen z-50">
        <div class="p-6 flex items-center space-x-3 mb-4">
          <div class="p-2 bg-primary text-primary-foreground rounded-lg shadow-sm">
            <Store class="w-6 h-6" />
          </div>
          <h1 class="font-bold text-lg tracking-tight">Warung Zavi</h1>
        </div>
        
        <nav class="flex-1 px-4 space-y-1">
          <router-link v-for="item in navItems" :key="item.id" 
            :to="item.path"
            :class="cn(
              'nav-btn group flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200',
              route.path === item.path 
                ? 'bg-secondary text-primary font-semibold shadow-sm' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
            )">
            <component :is="item.icon" :class="cn('w-4 h-4', route.path === item.path ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="p-4 border-t border-border mt-auto">
          <button @click="logout" class="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-sm font-medium">
            <LogOut class="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Bottom Nav -->
      <nav class="fixed bottom-0 left-0 w-full glass border-t border-border md:hidden flex justify-around items-center py-2 z-50 px-2 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <router-link v-for="item in navItems" :key="item.id" 
          :to="item.path"
          :class="cn(
            'flex flex-col items-center p-2 rounded-md transition-all',
            route.path === item.path ? 'text-primary' : 'text-muted-foreground'
          )">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] mt-1 font-medium">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <!-- Header -->
        <header class="h-16 bg-card border-b border-border sticky top-0 z-40 px-6 flex justify-between items-center shrink-0 shadow-sm">
          <div class="flex items-center space-x-2 text-primary font-black uppercase tracking-widest text-[10px]">
            <router-link to="/" class="hover:text-foreground opacity-60 transition-all">Home</router-link>
            <span class="opacity-30">/</span>
            <span class="text-sm font-medium text-muted-foreground px-2 py-0.5 bg-secondary rounded">{{ activeNavItem?.label }}</span>
            <div v-if="isSyncing" class="flex items-center space-x-2 ml-4 animate-in fade-in duration-300">
                <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span class="text-[10px] font-black uppercase tracking-widest text-primary opacity-70">Syncing...</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
             <button @click="reloadData" :class="cn('p-2 text-muted-foreground hover:text-primary rounded-md transition-colors', loading && 'animate-spin')">
              <RefreshCw class="w-4 h-4" />
            </button>
            <div class="h-4 w-[1px] bg-border mx-1"></div>
            <span class="text-xs text-muted-foreground hidden sm:inline">{{ todayFormatted }}</span>
            <div class="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-primary">
              DZ
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto pb-24 md:pb-10">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" :data="store" @action="handleAction" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Global Loading Spinner -->
    <div v-if="loading" class="fixed inset-0 bg-background/50 backdrop-blur-[1px] z-[100] flex items-center justify-center">
      <div class="flex flex-col items-center bg-card border border-border p-8 rounded-xl shadow-2xl">
        <div class="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-sm text-muted-foreground font-medium">Synchronizing...</p>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="toast" class="fixed bottom-6 right-6 md:top-20 md:right-8 z-[110] animate-in slide-in-from-right-10">
      <div :class="cn(
        'px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border',
        toast.variant === 'destructive' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-card text-foreground border-border'
      )">
        <div :class="cn('w-2 h-2 rounded-full', toast.variant === 'destructive' ? 'bg-white' : 'bg-primary')"></div>
        <span class="text-sm font-semibold tracking-tight">{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
