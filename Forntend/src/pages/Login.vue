<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">歡迎回來</h1>
      <p class="auth-subtitle">登入以繼續您的購物行程</p>

      <form @submit.prevent="handleLogin2" class="auth-form">
        <div class="input-group">
          <label>電子郵件</label>
          <input v-model="form.email" type="email" placeholder="請輸入 Email" required />
        </div>

        <div class="input-group">
          <label>密碼</label>
          <input v-model="form.password" type="password" placeholder="請輸入密碼" required />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登入中...' : '立即登入' }}
        </button>
      </form>

      <div class="auth-footer">
        還沒有帳號？ <router-link to="/register" class="reg-link">立即註冊</router-link>
      </div>

      <button class="back-link" @click="$router.push('/products')">〈 回到首頁</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import {useAuthStore} from "@/stores/auth";
import api from "@/api";

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})


const handleLogin2 = async() => {
  loading.value = true
  try {
    const res = await api.post('/api/Auth/login', form.value)

    // 🛑 偵探時間：讓我們看看後端到底回傳了什麼！
    console.log('====== 登入除錯開始 ======');
    console.log('1. res.data (完整):', res.data);
    console.log('2. res.data.userId 型別:', typeof res.data.userId);
    console.log('3. res.data.userId 內容:', res.data.userId);
    console.log('4. res.data.Uid:', res.data.Uid); // 有時候是叫 Uid?
    console.log('5. res.data.id:', res.data.id);   // 有時候是叫 id?
    console.log('=========================');

    // ✨ 嘗試找出真正的 ID (這裡我們先不要急著 String(), 先看 log)
    // 假設我們發現 userId 其實是一個物件，裡面還有 id
    // 例如: res.data.userId = { id: "u001", name: "..." }
    let realId = "";

    if (typeof res.data.userId === 'object' && res.data.userId !== null) {
      // 如果它真的是物件，我們嘗試去抓裡面的 id
      realId = res.data.userId.id || res.data.userId.Id || res.data.userId.userId;
    } else {
      // 否則就照舊找
      realId = res.data.userId || res.data.UserId || res.data.id || res.data.Uid;
    }

    // 強制轉成字串，防禦 [object Object]
    const finalIdString = String(realId || "");

    console.log('🎯 最終抓到的 ID (將存入):', finalIdString);

    const balance = res.data.balance ?? 0

    // 呼叫 Store
    authStore.login(
        res.data.token,
        res.data.name,
        res.data.avatar,
        balance,
        finalIdString, // 👈 傳入處理過的字串
    )

    await router.push('/products')
  }
  catch (err: any) {
    // ... (錯誤處理保持原樣)
    console.error(err)
    alert('登入失敗')
  } finally {
    loading.value = false
  }
}


</script>

<style scoped>
/* 延續 B 站粉紅風格 */
.auth-container { min-height: 100vh; background-color: #f4f4f4; display: flex; justify-content: center; align-items: center; padding: 20px; }
.auth-card { width: 100%; max-width: 400px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05); text-align: center; }
.auth-title { font-size: 24px; color: #333; margin-bottom: 8px; }
.auth-subtitle { color: #999; font-size: 14px; margin-bottom: 30px; }
.auth-form { text-align: left; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }
.input-group input { width: 100%; padding: 12px; border: 1px solid #e7e7e7; border-radius: 10px; font-size: 15px; box-sizing: border-box; }
.input-group input:focus { outline: none; border-color: #fb7299; background-color: #fff5f7; }
.btn-login { width: 100%; padding: 14px; background: #fb7299; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
.btn-login:disabled { background: #ffb3c7; }
.auth-footer { margin-top: 25px; font-size: 14px; color: #666; }
.reg-link { color: #fb7299; text-decoration: none; font-weight: bold; }
.back-link { margin-top: 25px; background: none; border: none; color: #999; cursor: pointer; }
</style>