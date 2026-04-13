<script setup>
import { ref, computed } from 'vue'
import { 
  Users, 
  Search, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  X,
  Receipt,
  Calendar
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])

const search = ref('')
const showModal = ref(false)
const selectedCustomer = ref(null)

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n)
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const publicLedger = computed(() => {
  if (!props.data?.customers || !props.data?.debts) return []
  
  const ledger = props.data.customers.map(customer => {
    const unpaidDebts = props.data.debts.filter(d => 
      d.customerid === customer.id && d.status === 'unpaid'
    )
    const total = unpaidDebts.reduce((acc, curr) => acc + parseFloat(curr.total), 0)
    
    return {
      id: customer.id,
      name: customer.name,
      total: total,
      debtCount: unpaidDebts.length,
      records: unpaidDebts.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  }).filter(item => item.total > 0)
  
  return ledger
    .filter(item => item.name.toLowerCase().includes(search.value.toLowerCase()))
    .sort((a, b) => b.total - a.total)
})

const overallTotal = computed(() => {
  return publicLedger.value.reduce((acc, curr) => acc + curr.total, 0)
})

const openDetail = (customer) => {
  selectedCustomer.value = customer
  showModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground pb-20">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-white border-b border-border">
      <div class="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
      <div class="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10 text-center">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary text-primary border border-border mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ShieldCheck class="w-4 h-4" />
          <span class="text-[10px] font-black uppercase tracking-widest">Official Debt Ledger</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          Warung Zavi<span class="text-primary">.</span>
        </h1>
        <p class="text-muted-foreground text-lg max-w-xl mx-auto font-medium italic animate-in fade-in slide-in-from-bottom-10 duration-1000">
          Public transparency record for outstanding shop credits and settlements.
        </p>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
      <div class="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="space-y-2 text-center md:text-left">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Shop Credit</p>
          <p class="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
            Rp {{ formatNumber(overallTotal) }}
          </p>
        </div>
        <div class="flex items-center space-x-4">
           <div class="h-12 w-[1px] bg-border hidden md:block"></div>
           <div class="text-center md:text-left">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Active Accounts</p>
              <div class="flex items-center space-x-2">
                 <Users class="w-5 h-5 text-primary" />
                 <span class="text-2xl font-black tracking-tighter">{{ publicLedger.length }} People</span>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-6 mt-12 space-y-8">
      <!-- Search -->
      <div class="relative group">
        <div class="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all"></div>
        <div class="relative">
          <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
          <input 
            type="text" 
            v-model="search" 
            placeholder="Search your name..." 
            class="w-full h-16 pl-14 pr-6 bg-card border border-border rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          >
        </div>
      </div>

      <!-- Ledger List -->
      <div class="space-y-4">
        <div v-for="(item, index) in publicLedger" :key="item.id" 
             @click="openDetail(item)"
             class="group bg-card border border-border p-6 rounded-2xl flex items-center justify-between hover:border-primary hover:shadow-xl transition-all duration-300 animate-in fade-in cursor-pointer active:scale-[0.98]"
             :style="{ animationDelay: (index * 50) + 'ms' }">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
              {{ item.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="text-xl font-black tracking-tight text-foreground">{{ item.name }}</h4>
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">{{ item.debtCount }} Active Record{{ item.debtCount > 1 ? 's' : '' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">Amount Due</p>
            <p class="text-2xl font-black tracking-tighter">Rp {{ formatNumber(item.total) }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="publicLedger.length === 0" class="py-20 text-center space-y-4">
           <div class="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Users class="w-10 h-10 text-muted-foreground/30" />
           </div>
           <h3 class="text-xl font-black tracking-tighter text-foreground">No matches found</h3>
           <p class="text-muted-foreground font-medium italic">Try searching for a different name or contact the owner.</p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="pt-12 border-t border-border flex flex-col items-center space-y-6">
         <div class="flex items-center space-x-2 text-xs text-muted-foreground font-bold italic">
            <Info class="w-4 h-4" />
            <span>Data is synchronized every 5 minutes from the central ledger.</span>
         </div>
         <router-link to="/login" class="inline-flex items-center space-x-2 text-sm font-black text-primary hover:underline group">
            <span>Admin Access</span>
            <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
         </router-link>
      </div>
    </main>

    <!-- Public Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl scale-in-95">
        <!-- Modal Header -->
        <div class="p-8 text-center border-b border-border bg-muted/20 relative">
          <button @click="showModal = false" class="absolute top-4 right-4 p-2 hover:bg-secondary rounded-xl transition-colors">
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div class="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 shadow-xl transform rotate-3">
            <Receipt class="w-8 h-8" />
          </div>
          
          <h3 class="text-3xl font-black tracking-tighter">{{ selectedCustomer.name }}</h3>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Active Credit History</p>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-muted/5">
          <div v-for="record in selectedCustomer.records" :key="record.id" 
               class="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
            <div class="flex justify-between items-start">
              <div class="flex items-center space-x-2 text-xs font-bold text-muted-foreground">
                <Calendar class="w-3.5 h-3.5 opacity-60" />
                <span>{{ formatDate(record.date) }}</span>
              </div>
              <p class="text-lg font-black tracking-tighter">Rp {{ formatNumber(record.total) }}</p>
            </div>
            <div class="pt-3 border-t border-border/50">
               <div class="flex flex-wrap gap-2">
                  <span v-for="item in record.items.split(',')" :key="item" 
                        class="px-3 py-1 bg-secondary border border-border rounded-lg text-xs font-bold tracking-tight">
                    {{ item.trim() }}
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-8 bg-card border-t border-border flex justify-between items-center">
            <div>
               <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Outstanding</p>
               <p class="text-3xl font-black tracking-tighter text-primary">Rp {{ formatNumber(selectedCustomer.total) }}</p>
            </div>
            <button @click="showModal = false" class="btn-primary px-8 h-12 text-sm font-black uppercase tracking-widest shadow-xl">
               Dismiss
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-slate-900\/\[0\.04\] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
}
</style>
