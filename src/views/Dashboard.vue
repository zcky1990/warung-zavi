<script setup>
import { computed } from 'vue'
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  Package,
  Plus,
  ArrowRight,
  ChevronRight
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n)
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

const stats = computed(() => {
    const today = new Date().toDateString()
    const todayIncome = props.data.income
        .filter(i => new Date(i.date).toDateString() === today)
        .reduce((sum, curr) => sum + Number(curr.amount), 0)
    
    const totalDebt = props.data.debts
        .filter(d => d.status === 'unpaid')
        .reduce((sum, curr) => sum + Number(curr.total), 0)

    return [
        { label: "Today's Revenue", value: `Rp ${formatNumber(todayIncome)}`, icon: TrendingUp, color: 'text-foreground' },
        { label: "Total Unpaid", value: `Rp ${formatNumber(totalDebt)}`, icon: Receipt, color: 'text-foreground' },
        { label: "Total Customers", value: props.data.customers.length, icon: Users, color: 'text-foreground' },
        { label: "Stock Items", value: props.data.products.length, icon: Package, color: 'text-foreground' },
    ]
})

const recentActivities = computed(() => {
    return [...props.data.debts, ...props.data.income].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
})
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <component :is="s.icon" class="w-5 h-5" />
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
        </div>
        <div>
          <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{{ s.label }}</p>
          <p class="text-2xl font-black tracking-tighter text-foreground">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Activity Feed -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold tracking-tight px-1">Recent Activity</h3>
            <button class="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center">
                View all <ArrowRight class="w-3 h-3 ml-1" />
            </button>
        </div>
        <div class="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden shadow-sm">
          <div v-for="act in recentActivities" :key="act.id" class="p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div class="flex items-center space-x-4">
              <div :class="cn('w-10 h-10 rounded-full flex items-center justify-center border', act.amount ? 'bg-secondary text-primary border-border' : 'bg-primary text-primary-foreground border-primary')">
                <component :is="act.amount ? TrendingUp : Receipt" class="w-5 h-5" />
              </div>
              <div>
                <p class="font-bold text-sm tracking-tight text-foreground">{{ act.source || props.data.customers.find(c => c.id === act.customerid)?.name || 'Unknown' }}</p>
                <p class="text-xs text-muted-foreground font-medium">{{ formatDate(act.date) }} • {{ act.items || act.method }}</p>
              </div>
            </div>
            <p :class="cn('text-sm font-black tracking-tight', act.amount ? 'text-primary' : 'text-foreground')">
                {{ act.amount ? '+' : '' }}Rp {{ formatNumber(act.amount || act.total) }}
            </p>
          </div>
          <div v-if="recentActivities.length === 0" class="p-12 text-center text-muted-foreground text-sm font-medium italic">
            No recent activity recorded
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold tracking-tight px-1">Quick Actions</h3>
        <div class="bg-card border border-border p-6 rounded-xl shadow-sm space-y-3">
          <button @click="$router.push('/debts')" class="w-full btn-primary justify-between group h-12">
            Add New Debt Record
            <Plus class="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform" />
          </button>
          <button @click="$router.push('/customers')" class="w-full btn-outline justify-between h-12">
            Register New Buyer
            <Users class="w-4 h-4 ml-2" />
          </button>
          <div class="pt-4 mt-4 border-t border-border">
            <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">System Status</p>
            <div class="flex items-center justify-between text-xs font-semibold px-2">
                <span class="text-muted-foreground">Server Logic</span>
                <span class="flex items-center text-primary">
                    <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-2"></div>
                    Online
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
