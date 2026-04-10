<script setup>
import { ref, computed } from 'vue'
import { 
  Search, 
  PlusCircle, 
  Receipt, 
  X, 
  Wallet, 
  Banknote, 
  Landmark, 
  Smartphone, 
  QrCode, 
  Edit2,
  ChevronRight,
  User,
  Package,
  Calendar
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])
const emit = defineEmits(['action'])

const search = ref('')
const statusFilter = ref('unpaid')
const showEntryModal = ref(false)
const showPaymentModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)

const selectedProduct = ref(null)
const currentDebt = ref(null)
const selectedDebtDetail = ref(null)

const cart = ref([])
const manualItemName = ref('')
const manualItemPrice = ref(0)

const debtForm = ref({ 
    id: null, 
    customerId: '', 
    items: '', 
    total: 0 
})

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n)
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const getCustomerName = (id) => props.data.customers.find(c => c.id === id)?.name || 'Unknown'

const filteredDebts = computed(() => {
    return props.data.debts.filter(d => {
        const name = getCustomerName(d.customerid).toLowerCase()
        const items = d.items.toLowerCase()
        const query = search.value.toLowerCase()
        const matchesSearch = name.includes(query) || items.includes(query)
        const matchesFilter = statusFilter.value === 'all' || d.status === statusFilter.value
        return matchesSearch && matchesFilter
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const parseItems = (itemsString) => {
    if (!itemsString) return []
    // Split by comma if it contains commas, or just return as one item
    return itemsString.split(',').map(i => i.trim()).filter(i => i !== '')
}

const addToCart = () => {
    if (selectedProduct.value) {
        cart.value.push({
            name: selectedProduct.value.name,
            qty: 1,
            price: selectedProduct.value.price
        })
        selectedProduct.value = null
        updateTotalFromCart()
    }
}

const addManualToCart = () => {
    if (manualItemName.value && manualItemPrice.value > 0) {
        cart.value.push({
            name: manualItemName.value,
            qty: 1,
            price: manualItemPrice.value
        })
        manualItemName.value = ''
        manualItemPrice.value = 0
        updateTotalFromCart()
    }
}

const removeFromCart = (index) => {
    cart.value.splice(index, 1)
    updateTotalFromCart()
}

const updateTotalFromCart = () => {
    debtForm.value.total = cart.value.reduce((acc, curr) => acc + (curr.price * curr.qty), 0)
    debtForm.value.items = cart.value.map(i => `${i.name} (${i.qty})`).join(', ')
}

const openDetail = (debt) => {
    selectedDebtDetail.value = debt
    showDetailModal.value = true
}

const editDebt = (debt) => {
    isEditing.value = true
    debtForm.value = { 
        id: debt.id,
        customerId: debt.customerid,
        items: debt.items,
        total: debt.total
    }
    // Try to pre-fill cart if it looks like our format
    cart.value = parseItems(debt.items).map(itemStr => {
        const match = itemStr.match(/(.*) \((\d+)\)/)
        if (match) {
            return { name: match[1], qty: parseInt(match[2]), price: 0 } // price unknown on edit
        }
        return { name: itemStr, qty: 1, price: 0 }
    })
    showEntryModal.value = true
}

const closeModal = () => {
    showEntryModal.value = false
    isEditing.value = false
    debtForm.value = { id: null, customerId: '', items: '', total: 0 }
    cart.value = []
    selectedProduct.value = null
}

const submitDebt = () => {
    const actionType = isEditing.value ? 'update_debt' : 'add_debt'
    emit('action', { type: actionType, payload: { ...debtForm.value } })
    closeModal()
}

const initPayment = (d) => {
    currentDebt.value = d
    showPaymentModal.value = true
}

const confirmPayment = (method) => {
    emit('action', { 
        type: 'pay_debt', 
        payload: { debtId: currentDebt.value.id, amount: currentDebt.value.total, method } 
    })
    showPaymentModal.value = false
    showDetailModal.value = false
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Page Header & Filters -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-4">
      <div class="space-y-1">
        <h2 class="text-2xl font-black tracking-tighter">Debt Ledger</h2>
        <p class="text-sm text-muted-foreground font-medium italic">Track unpaid balances and manage settlements</p>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div class="relative flex-1 lg:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input type="text" v-model="search" placeholder="Search entries..." class="w-full pl-9 h-11 bg-card border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm">
        </div>
        <select v-model="statusFilter" class="h-11 px-4 bg-card border border-input rounded-md text-sm font-bold tracking-tight outline-none focus:ring-1 focus:ring-primary shadow-sm">
          <option value="unpaid">Unpaid Only</option>
          <option value="paid">Settled Only</option>
          <option value="all">Every Record</option>
        </select>
        <button @click="isEditing = false; showEntryModal = true" class="btn-primary h-11 px-6 shadow-md">
          <PlusCircle class="w-4 h-4 mr-2" />
          <span class="font-bold tracking-tight">New Record</span>
        </button>
      </div>
    </div>

    <!-- Debt List -->
    <div class="grid grid-cols-1 gap-4">
      <div v-for="d in filteredDebts" :key="d.id" 
           @click="openDetail(d)"
           class="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:border-primary/40 hover:shadow-md transition-all cursor-pointer relative group">
        
        <div class="flex items-center space-x-5 mb-4 md:mb-0">
          <div :class="cn('w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner', d.status === 'paid' ? 'bg-secondary border-border text-muted-foreground' : 'bg-primary text-primary-foreground border-primary')">
            <Receipt class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
                <h4 class="font-black text-lg tracking-tight text-foreground">{{ getCustomerName(d.customerid) }}</h4>
                <div v-if="d.status === 'paid'" class="px-2 py-0.5 bg-secondary text-muted-foreground border border-border rounded-md text-[8px] font-black uppercase tracking-widest">Settled</div>
            </div>
            <div class="flex items-center space-x-3 text-xs font-bold text-muted-foreground mt-1">
                <span class="flex items-center tracking-tighter"><Calendar class="w-3 h-3 mr-1 opacity-60" /> {{ formatDate(d.date).split(',')[0] }}</span>
                <span class="w-1 h-1 bg-border rounded-full"></span>
                <span class="flex items-center tracking-tight opacity-80 truncate max-w-[200px]"><Package class="w-3 h-3 mr-1 opacity-60" /> {{ d.items }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between md:space-x-12">
          <div class="text-right">
            <p class="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total</p>
            <p class="text-xl font-black tracking-tighter text-foreground">Rp {{ formatNumber(d.total) }}</p>
          </div>
          <ChevronRight class="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </div>
      <div v-if="filteredDebts.length === 0" class="bg-card p-20 border border-border border-dashed rounded-xl flex flex-col items-center">
        <Receipt class="w-12 h-12 text-muted-foreground/20 mb-4" />
        <p class="text-muted-foreground text-sm font-medium italic">No ledger entries matching criteria</p>
      </div>
    </div>

    <!-- Entry Modal (Add/Edit) -->
    <div v-if="showEntryModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl scale-in-95">
        <div class="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 class="text-lg font-black tracking-tight text-foreground">{{ isEditing ? 'Revise Ledger Entry' : 'New Cart Entry' }}</h3>
          <button @click="closeModal" class="p-1 hover:bg-secondary rounded-md transition-colors">
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Buyer Profile</label>
                <select v-model="debtForm.customerId" required class="form-input" :disabled="isEditing">
                  <option value="">Select Customer...</option>
                  <option v-for="c in data.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <!-- Cart Build Section -->
              <div v-if="!isEditing" class="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Build Cart</p>
                
                <div class="flex gap-2">
                    <select v-model="selectedProduct" class="form-input flex-1">
                        <option :value="null">Katalog Barang...</option>
                        <option v-for="p in data.products" :key="p.id" :value="p">{{ p.name }} - Rp {{ formatNumber(p.price) }}</option>
                    </select>
                    <button @click="addToCart" type="button" class="btn-outline px-4 shrink-0">Add</button>
                </div>

                <div class="flex gap-2 pt-2 border-t border-border/50">
                    <input type="text" v-model="manualItemName" placeholder="Barang manual..." class="form-input flex-1">
                    <input type="number" v-model="manualItemPrice" placeholder="Harga" class="form-input w-24">
                    <button @click="addManualToCart" type="button" class="btn-outline px-4 shrink-0">Add</button>
                </div>
              </div>

              <!-- Cart List -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Current Cart</label>
                <div class="border border-border rounded-lg divide-y divide-border bg-card">
                  <div v-for="(item, idx) in cart" :key="idx" class="p-3 flex items-center justify-between group">
                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-secondary rounded flex items-center justify-center text-[10px] font-bold">{{ idx + 1 }}</div>
                        <div>
                            <p class="text-sm font-bold tracking-tight">{{ item.name }}</p>
                            <p class="text-[10px] text-muted-foreground font-medium">Rp {{ formatNumber(item.price) }} / unit</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <input type="number" v-model="item.qty" @input="updateTotalFromCart" class="w-16 h-8 bg-muted/50 border-input border rounded-md text-xs text-center font-bold">
                        <button @click="removeFromCart(idx)" class="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <div v-if="cart.length === 0" class="p-8 text-center text-xs text-muted-foreground italic font-medium">Cart is currently empty</div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Summary String (Auto-generated)</label>
                <input type="text" v-model="debtForm.items" required class="form-input bg-muted/10 text-xs font-medium" placeholder="Items summary...">
              </div>
          </div>
        </div>

        <div class="p-6 border-t border-border bg-muted/20 flex items-center justify-between">
            <div class="text-left">
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Balance</p>
                <p class="text-2xl font-black tracking-tighter text-foreground">Rp {{ formatNumber(debtForm.total) }}</p>
            </div>
            <div class="flex space-x-3">
                <button type="button" @click="closeModal" class="btn-outline h-11 px-6 font-bold tracking-tight">Dismiss</button>
                <button @click="submitDebt" type="button" class="btn-primary h-11 px-8 font-bold tracking-tight shadow-lg" :disabled="cart.length === 0 && !isEditing">
                   {{ isEditing ? 'Sync Changes' : 'Post to Ledger' }}
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[105] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
        <div class="p-8 text-center border-b border-border bg-muted/20 relative">
          <button @click="showDetailModal = false" class="absolute top-4 right-4 p-1 hover:bg-secondary rounded-md">
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div :class="cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 border shadow-xl transform rotate-3', selectedDebtDetail.status === 'paid' ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground')">
            <Receipt class="w-8 h-8" />
          </div>
          
          <h3 class="text-2xl font-black tracking-tighter">{{ getCustomerName(selectedDebtDetail.customerid) }}</h3>
          <p class="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">{{ formatDate(selectedDebtDetail.date) }}</p>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="space-y-3">
             <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Itemized List</p>
             <div class="space-y-2">
                <div v-for="(item, i) in parseItems(selectedDebtDetail.items)" :key="i" class="flex items-center space-x-3 text-sm font-bold tracking-tight text-foreground/80 bg-muted/10 p-3 rounded-lg border border-border/50">
                    <ChevronRight class="w-4 h-4 text-primary shrink-0" />
                    <span>{{ item }}</span>
                </div>
             </div>
          </div>
          
          <div class="pt-6 border-t border-border flex justify-between items-end">
             <div>
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Record ID</p>
                <p class="text-xs font-mono font-bold opacity-30">#{{ selectedDebtDetail.id.slice(0, 8) }}</p>
             </div>
             <div class="text-right">
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Final Amount</p>
                <p class="text-3xl font-black tracking-tighter text-foreground">Rp {{ formatNumber(selectedDebtDetail.total) }}</p>
             </div>
          </div>
        </div>
        
        <div class="p-6 bg-muted/20 border-t border-border flex space-x-3">
            <button v-if="selectedDebtDetail.status === 'unpaid'" @click="editDebt(selectedDebtDetail); showDetailModal = false" class="btn-outline flex-1 h-12 font-bold uppercase tracking-widest text-[10px]">Edit Entry</button>
            <button v-if="selectedDebtDetail.status === 'unpaid'" @click="initPayment(selectedDebtDetail)" class="btn-primary flex-[2] h-12 font-bold uppercase tracking-widest text-[10px]">Settle Now</button>
            <div v-else class="w-full py-4 text-center bg-secondary border border-border text-muted-foreground text-xs font-black uppercase tracking-widest rounded-xl">Transaction Settled</div>
        </div>
      </div>
    </div>

    <!-- Settlement Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
        <div class="p-10 text-center bg-muted/20 relative border-b border-border">
          <button @click="showPaymentModal = false" class="absolute top-4 right-4 p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground">
            <X class="w-5 h-5" />
          </button>
          <div class="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-3">
            <Wallet class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-black tracking-tight text-foreground">Settle Balance</h3>
          <p class="text-muted-foreground text-sm font-medium mt-1">Closing account for {{ getCustomerName(currentDebt.customerid) }}</p>
          <div class="mt-6 py-4 px-6 bg-background border border-border rounded-xl inline-block">
             <p class="text-3xl font-black tracking-tighter text-foreground">Rp {{ formatNumber(currentDebt.total) }}</p>
          </div>
        </div>
        <div class="p-8">
          <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center mb-6">Verified Payment Methods</p>
          <div class="grid grid-cols-2 gap-3">
            <button v-for="method in [['Cash', Banknote], ['Transfer', Landmark], ['Dana', Smartphone], ['QRIS', QrCode]]" 
                :key="method[0]"
                @click="confirmPayment(method[0])" 
                class="flex flex-col items-center justify-center p-5 rounded-xl border border-border hover:border-primary hover:bg-muted/50 transition-all group"
            >
              <component :is="method[1]" class="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
              <span class="text-xs font-black tracking-tight text-foreground uppercase">{{ method[0] }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
