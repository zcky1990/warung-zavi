<script setup>
import { computed } from 'vue'
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  CreditCard, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n)
const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
const formatDateLong = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

const todayTotal = computed(() => {
    const today = new Date().toDateString()
    return props.data.income
        .filter(i => new Date(i.date).toDateString() === today)
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
})

const filteredIncome = computed(() => {
    const today = new Date().toDateString()
    return props.data.income
        .filter(i => new Date(i.date).toDateString() === today)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-500">
    <!-- Summary Section -->
    <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
      <div class="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-border bg-muted/10">
        <div class="flex items-center space-x-2 text-muted-foreground mb-4">
            <Calendar class="w-4 h-4" />
            <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">Operating Revenue</span>
        </div>
        <div class="space-y-2">
            <p class="text-xs font-bold text-muted-foreground">{{ formatDateLong(new Date()) }}</p>
            <p class="text-5xl font-black tracking-tighter text-foreground">
                <span class="text-2xl align-top mr-1 opacity-50">Rp</span>{{ formatNumber(todayTotal) }}
            </p>
        </div>
      </div>
    </div>

    <!-- Transaction Table -->
    <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-20">
      <div class="px-8 py-5 border-b border-border bg-muted/20 flex justify-between items-center">
        <h4 class="text-lg font-black tracking-tight text-foreground">Transaction Registry</h4>
        <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Clock class="w-3 h-3 mr-1.5" /> Recent Logs
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-muted/10 border-b border-border">
              <th class="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
              <th class="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source/Category</th>
              <th class="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Method</th>
              <th class="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="i in filteredIncome" :key="i.id" class="hover:bg-muted/40 transition-colors group">
              <td class="px-8 py-5 text-xs font-bold text-muted-foreground font-mono">
                {{ formatTime(i.date) }}
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col">
                    <span class="text-sm font-black tracking-tight text-foreground">{{ i.source }}</span>
                    <span class="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">Commercial Log #{{ i.id.slice(0, 4) }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center space-x-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                    <span class="text-xs font-bold text-muted-foreground uppercase tracking-tight">{{ i.method }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right font-black text-sm tracking-tighter text-foreground">
                Rp {{ formatNumber(i.amount) }}
              </td>
            </tr>
            <tr v-if="filteredIncome.length === 0">
              <td colspan="4" class="px-8 py-20 text-center text-muted-foreground text-sm font-medium italic">
                No revenue entries recorded for the current session
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-8 py-5 bg-muted/10 border-t border-border flex justify-end">
          <button class="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center">
              Export CSV Ledger <ArrowRight class="w-3 h-3 ml-2" />
          </button>
      </div>
    </div>
  </div>
</template>
