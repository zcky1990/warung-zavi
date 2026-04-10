<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, MapPin, X, Edit2, Phone } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps(['data'])
const emit = defineEmits(['action'])

const search = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const form = ref({ id: null, name: '', phone: '', address: '' })

const filteredCustomers = computed(() => {
    return props.data.customers.filter(c => 
        c.name.toLowerCase().includes(search.value.toLowerCase())
    )
})

const editCustomer = (customer) => {
    isEditing.value = true
    form.value = { ...customer }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    isEditing.value = false
    form.value = { id: null, name: '', phone: '', address: '' }
}

const submit = () => {
    const actionType = isEditing.value ? 'update_customer' : 'add_customer'
    emit('action', { type: actionType, payload: { ...form.value } })
    closeModal()
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
      <div class="space-y-1">
        <h2 class="text-2xl font-black tracking-tighter">Customer Directory</h2>
        <p class="text-sm text-muted-foreground font-medium italic">Monitor and manage your regular buyers</p>
      </div>
      <button @click="isEditing = false; showModal = true" class="btn-primary space-x-2 w-full sm:w-auto h-11 px-6 shadow-sm">
        <Plus class="w-4 h-4" />
        <span class="font-bold tracking-tight">Add Buyer</span>
      </button>
    </div>

    <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-border bg-muted/20">
        <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              v-model="search" 
              placeholder="Search by name..." 
              class="w-full pl-9 h-9 bg-background border border-input rounded-md text-sm shadow-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            >
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-muted/10 border-b border-border">
              <th class="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Buyer Name</th>
              <th class="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone</th>
              <th class="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Address</th>
              <th class="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="c in filteredCustomers" :key="c.id" class="hover:bg-muted/40 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-secondary border border-border rounded-lg flex items-center justify-center text-primary font-black text-xs tracking-tighter">
                        {{ c.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-sm tracking-tight text-foreground">{{ c.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold text-muted-foreground">{{ c.phone || '-' }}</span>
              </td>
              <td class="px-6 py-4">
                <p class="text-xs text-muted-foreground font-medium truncate max-w-[200px]" :title="c.address">
                    {{ c.address || 'No address listed' }}
                </p>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="editCustomer(c)" class="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-all">
                  <Edit2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="4" class="px-6 py-16 text-center text-muted-foreground text-sm font-medium italic">
                No matches found in directory
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Customer Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95">
        <div class="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 class="text-lg font-black tracking-tight text-foreground">{{ isEditing ? 'Update Profile' : 'New Buyer' }}</h3>
          <button @click="closeModal" class="p-1 hover:bg-secondary rounded-md transition-colors">
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form @submit.prevent="submit" class="p-6 space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Buyer Name *</label>
            <input type="text" v-model="form.name" required class="form-input" placeholder="Full name">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Connection</label>
            <input type="text" v-model="form.phone" class="form-input" placeholder="+62 8xx">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Home Address</label>
            <textarea v-model="form.address" rows="3" class="form-input resize-none" placeholder="Residential info..."></textarea>
          </div>
          <div class="pt-4 flex space-x-3">
            <button type="button" @click="closeModal" class="btn-outline flex-1 h-12 font-bold tracking-tight">Discard</button>
            <button type="submit" class="btn-primary flex-[2] h-12 font-bold tracking-tight shadow-md">
              {{ isEditing ? 'Save Profile' : 'Register Buyer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
