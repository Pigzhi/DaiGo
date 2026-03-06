<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">歡迎使用</h1>
      <p class="auth-subtitle"></p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>暱稱</label>
          <input v-model="form.name" type="text" placeholder="暱稱即可" required />
        </div>

        <div class="input-group">
          <label>電子郵件</label>
          <input v-model="form.email" type="email" placeholder="example@mail.com" required />
        </div>

        <div class="input-group">
          <label>密碼</label>
          <input v-model="form.password" type="password" placeholder="至少 6 位字元" required />
        </div>

        <div class="input-group">
          <label>聯絡電話</label>
          <input v-model="form.phone" type="text" placeholder="選填" />
        </div>

        <button type="submit" class="btn-register" :disabled="loading">
          {{ loading ? '註冊中...' : '立即註冊' }}
        </button>
      </form>

      <div class="auth-footer">
        已有帳號？ <router-link to="/login" class="login-link">直接登入</router-link>
      </div>

      <button class="back-link" @click="$router.back()">〈 返回上一頁</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: ''
})

const handleRegister = async () => {
  loading.value = true;
  try {
    // ⚠️ 關鍵點：請把 7045 改成妳後端實際跑起來的埠號
    const res = await axios.post('http://localhost:5275/api/Auth/register', form.value);

    // 成功後的動作
    console.log('後端回傳的資料：', res.data);
    alert('註冊成功！');
    await router.push('/login'); // 跳轉到登入頁面
  } catch (err) {
    // 失敗後的處理
    console.error(err);
    alert('註冊失敗：' + (err.response?.data || '伺服器連線失敗'));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.auth-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: #999;
  font-size: 14px;
  margin-bottom: 30px;
}

.auth-form {
  text-align: left;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e7e7e7;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #fb7299;
  background-color: #fff5f7;
}

.btn-register {
  width: 100%;
  padding: 14px;
  background: #fb7299;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.btn-register:disabled {
  background: #ffb3c7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.login-link {
  color: #fb7299;
  text-decoration: none;
  font-weight: bold;
}

.back-link {
  margin-top: 30px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

.back-link:hover {
  color: #fb7299;
}
</style>