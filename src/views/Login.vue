<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Store, ArrowRight, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const loginForm = ref({ username: '', password: '' })
const loginError = ref('')
const isSubmitting = ref(false)

const handleLogin = () => {
    isSubmitting.value = true
    const adminUser = import.meta.env.VITE_WARUNG_ZAVI_ADMIN_USERNAME || 'devia'
    const adminPass = import.meta.env.VITE_WARUNG_ZAVI_ADMIN_PASSWORD || 'password123'
    
    // Tiny delay to show the nice loader
    setTimeout(() => {
        if (loginForm.value.username === adminUser && loginForm.value.password === adminPass) {
            localStorage.setItem('isLoggedIn', 'true')
            router.push('/')
        } else {
            loginError.value = 'Invalid credentials. Please try again.'
            isSubmitting.value = false
        }
    }, 600)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
    <div class="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-500">
      <div class="flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-6">
          <Store class="w-10 h-10" />
        </div>
        <h1 class="text-3xl font-black tracking-tighter text-foreground">Warung Zavi</h1>
        <p class="text-muted-foreground mt-2 font-medium">Debt Tracking & Management System</p>
      </div>
      
      <div class="bg-card border border-border p-8 rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-primary/10"></div>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-bold tracking-tight text-foreground uppercase ml-1 opacity-70">Username</label>
            <input 
              type="text" 
              v-model="loginForm.username" 
              class="form-input" 
              placeholder="Username" 
              required
              tabindex="1"
            >
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center px-1">
              <label class="text-sm font-bold tracking-tight text-foreground uppercase opacity-70">Password</label>
              <button type="button" class="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Forgot?</button>
            </div>
            <input 
              type="password" 
              v-model="loginForm.password" 
              class="form-input" 
              placeholder="••••••••" 
              required
              tabindex="2"
            >
          </div>
          
          <div v-if="loginError" class="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-bold text-center animate-shake">
            {{ loginError }}
          </div>
          
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="btn-primary w-full group relative overflow-hidden h-12 text-base font-bold tracking-tight"
          >
            <span v-if="!isSubmitting" class="flex items-center justify-center">
              Login to Terminal
              <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
            <Loader2 v-else class="w-5 h-5 animate-spin" />
          </button>
        </form>
      </div>
      
      <p class="text-center text-sm text-muted-foreground font-medium">
        Don't have an account? <span class="text-primary font-bold cursor-not-allowed border-b border-primary/20">Contact Admin</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
