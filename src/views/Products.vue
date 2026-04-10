<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, Edit2, X, MoreVertical } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])
const emit = defineEmits(['action'])

const search = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const form = ref({ id: null, name: '', price: '', category: '' })

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n)

const filteredProducts = computed(() => {
    return props.data.products.filter(p => 
        p.name.toLowerCase().includes(search.value.toLowerCase())
    )
})

const editProduct = (product) => {
    isEditing.value = true
    form.value = { ...product }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    isEditing.value = false
    form.value = { id: null, name: '', price: '', category: '' }
}

const submit = () => {
    const actionType = isEditing.value ? 'update_product' : 'add_product'
    emit('action', { type: actionType, payload: { ...form.value } })
    closeModal()
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
      <div class="space-y-1">
        <h2 class="text-2xl font-black tracking-tighter">Product Inventory</h2>
        <p class="text-sm text-muted-foreground font-medium italic">Manage your store items and pricing</p>
      </div>
      <button @click="isEditing = false; showModal = true" class="btn-primary space-x-2 w-full sm:w-auto h-11 px-6 shadow-sm">
        <Plus class="w-4 h-4" />
        <span class="font-bold tracking-tight">Add Product</span>
      </button>
    </div>

    <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-border bg-muted/30">
        <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              v-model="search" 
              placeholder="Search products by name..." 
              class="w-full pl-9 h-9 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            >
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-muted/20 border-b border-border">
              <th class="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Name</th>
              <th class="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</th>
              <th class="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pricing</th>
              <th class="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-muted/40 transition-colors">
              <td class="px-6 py-4">
                <p class="font-bold text-sm tracking-tight text-foreground">{{ p.name }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 bg-secondary border border-border text-muted-foreground rounded text-[10px] font-bold uppercase">{{ p.category || 'General' }}</span>
              </td>
              <td class="px-6 py-4 font-black text-sm tracking-tighter text-foreground">Rp {{ formatNumber(p.price) }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="editProduct(p)" class="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all">
                  <Edit2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="4" class="px-6 py-16 text-center text-muted-foreground text-sm font-medium italic">No products found in catalog</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
        <div class="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 class="text-lg font-black tracking-tight text-foreground">{{ isEditing ? 'Edit Product' : 'New Product' }}</h3>
          <button @click="closeModal" class="p-1 hover:bg-secondary rounded-md transition-colors">
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form @submit.prevent="submit" class="p-6 space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Product Name</label>
            <input type="text" v-model="form.name" required class="form-input" placeholder="e.g. Beras 5kg">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Price</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rp</span>
                <input type="number" v-model="form.price" required class="form-input pl-10" placeholder="0">
              </div>
            </div>
            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Category</label>
              <input type="text" v-model="form.category" class="form-input" placeholder="e.g. Sembako">
            </div>
          </div>
          <div class="pt-4 flex space-x-3">
            <button type="button" @click="closeModal" class="btn-outline flex-1 h-12 font-bold tracking-tight">Cancel</button>
            <button type="submit" class="btn-primary flex-[2] h-12 font-bold tracking-tight shadow-md">
              {{ isEditing ? 'Save Changes' : 'Create Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
