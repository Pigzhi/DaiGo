<template>
  <div class="wallet-page">
    <div class="mode-switcher">
      <button
          :class="['switch-btn', { active: currentMode === 'deposit' }]"
          @click="currentMode = 'deposit'"
      >
        儲值
      </button>
      <button
          :class="['switch-btn', { active: currentMode === 'withdraw' }]"
          @click="currentMode = 'withdraw'"
      >
        提現
      </button>
    </div>

    <!-- 儲值頁面 -->
    <div v-if="currentMode === 'deposit'" class="wallet-content">
      <div class="balance-cards">
        <div class="balance-card">
          <div class="balance-label">可用餘額</div>
          <div class="balance-amount">NT$ {{ availableBalance.toLocaleString() }}</div>
        </div>
        <div class="balance-card">
          <div class="balance-label">圈存金額</div>
          <div class="balance-amount">NT$ {{ escrowBalance.toLocaleString() }}</div>
        </div>
      </div>

      <div class="deposit-section">
        <h3 class="section-title">選擇儲值金額</h3>
        <div class="amount-grid">
          <button
              v-for="amount in depositAmounts"
              :key="amount"
              :class="['amount-btn', { selected: selectedAmount === amount }]"
              @click="selectedAmount = amount"
          >
            NT$ {{ amount.toLocaleString() }}
          </button>
        </div>
        <button class="action-btn" @click="onDeposit">
          確認儲值
        </button>
      </div>
    </div>

    <!-- 提現頁面 -->
    <div v-else class="wallet-content">
      <div class="balance-cards">
        <div class="balance-card">
          <div class="balance-label">可用餘額</div>
          <div class="balance-amount">NT$ {{ availableBalance.toLocaleString() }}</div>
        </div>
        <div class="balance-card">
          <div class="balance-label">未實現收益</div>
          <div class="balance-amount">NT$ {{ escrowBalance.toLocaleString() }}</div>
        </div>
      </div>

      <div class="withdraw-section">
        <h3 class="section-title">提現資訊</h3>
        <div class="form-group">
          <label class="form-label">銀行代碼</label>
          <input
              v-model="withdrawForm.bankCode"
              type="text"
              class="form-input"
              placeholder="例：012"
              maxlength="3"
          >
        </div>
        <div class="form-group">
          <label class="form-label">銀行帳號</label>
          <input
              v-model="withdrawForm.bankAccount"
              type="text"
              class="form-input"
              placeholder="請輸入銀行帳號"
          >
        </div>
        <div class="form-group">
          <label class="form-label">提領金額</label>
          <input
              v-model="withdrawForm.amount"
              type="number"
              class="form-input"
              placeholder="請輸入提領金額"
          >
        </div>
        <div class="form-group">
          <label class="form-label">使用者密碼</label>
          <input
              v-model="withdrawForm.password"
              type="password"
              class="form-input"
              placeholder="請輸入密碼確認"
          >
        </div>
        <button class="action-btn" @click="onWithdraw">
          確認提現
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {useWallet} from "@/composable/useWallet";

const {
  availableBalance,
  escrowBalance,
  isLoading,
  error,
  fetchWallet,
  handleDeposit,
  handleWithdraw,
} = useWallet();
const currentMode = ref<'deposit' | 'withdraw'>('deposit');
const authStore = useAuthStore();


const reservedBalance = ref(0);
const unrealizedIncome = ref(8960);
const depositAmounts = [500, 1000, 1500, 2000, 5000,10000];
const selectedAmount = ref<number | null>(null);

const withdrawForm = ref({
  bankCode: '',
  bankAccount: '',
  amount: '',
  password: ''
});

const onDeposit = async() => {
    if(!selectedAmount.value){
      console.log('儲值金額',selectedAmount.value);
      alert('請選擇儲值金額')
    }
    const success  = await handleDeposit(selectedAmount.value!);
  if (success) {
    alert('儲值成功!');
    selectedAmount.value = null;
  } else {
    alert('儲值失敗,請稍後再試');
  }
}

const onWithdraw = async() => {
  // 轉換金額為數字
  const amount = Number(withdrawForm.value.amount);

  const success = await handleWithdraw(amount);

  if (success) {
    alert('提現成功!');
    // 清空表單
    withdrawForm.value = {
      bankCode: '',
      bankAccount: '',
      amount: '',
      password: ''
    };
  } else {
    alert(error.value || '提現失敗,請稍後再試');
  }
}
onMounted(() => {
  // 頁面載入時，如果需要可以再刷一次最新的數據（例如從 API 獲取）
  fetchWallet()
});
</script>


<style scoped>
.wallet-page {
  padding: 10px;
  max-width: 800px;
  margin: 0 auto;
}

/* --- 模式切換按鈕 --- */
.mode-switcher {
  display: flex;
  background: #eee;
  padding: 4px;
  border-radius: 25px;
  width: fit-content;
  margin-bottom: 25px;
}

.switch-btn {
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  background: transparent;
  transition: all 0.3s;
}

.switch-btn.active {
  background: white;
  color: #fb7299;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* --- 餘額卡片 --- */
.balance-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.balance-card {
  background: #ff6b9d;
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.balance-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.35);
}

.balance-label {
  font-size: 14px;
  opacity: 0.95;
  margin-bottom: 8px;
  font-weight: 500;
}

.balance-amount {
  font-size: 28px;
  font-weight: bold;
}

/* --- 儲值/提現區塊 --- */
.wallet-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.amount-btn {
  border: 2px solid #e0e0e0;
  background: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.amount-btn:hover {
  border-color: #ff6b9d;
  color: #ff6b9d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);
}

.amount-btn.selected {
  border-color: #ff6b9d;
  background: #ff6b9d;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

/* --- 提現表單 --- */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b9d;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.form-input::placeholder {
  color: #ccc;
}

/* --- 操作按鈕 --- */
.action-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: #ff6b9d;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.action-btn:hover {
  background: #ff5c8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}
</style>
