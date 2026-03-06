<template>
  <div class="commissions-page">
    <div class="tab-switcher">
      <div class="tab-group">
        <button
            v-for="tab in leftTabs"
            :key="tab.id"
            :class="['switch-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-group">
        <button
            v-for="tab in rightTabs"
            :key="tab.id"
            :class="['switch-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="commissions-grid">
      <div
          v-for="item in filteredCommissions"
          :key="item.serviceCode"
          class="simple-card"
      >
        <div class="card-img-box">
          <img
              :src="item.imageUrl ? ('http://127.0.0.1:5275' + item.imageUrl) : 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg'"
              :alt="item.title"
              class="product-img"
          >
          <span class="img-tag" :class="getStatusClass(item.status)">{{ item.status }}</span>
        </div>

        <div class="card-info">
          <h3 class="product-name">{{ item.title }}</h3>

          <div class="detail-row">
            <span class="label">參考價格：</span>
            <span class="value price">{{item.currency}}$ {{ item.price }}</span>
          </div>

          <div class="detail-row">
            <span class="label">購買地點：</span>
            <span class="value">{{ item.location }}</span>
          </div>

          <div class="detail-row">
            <span class="label">截止日期：</span>
            <span class="value date">{{ formatDate(item.endAt) }}</span>
          </div>

          <div v-if="currentTab === 'failed'" class="failed-reason">
            <strong>失敗原因：{{item.reason}}</strong>
          </div>

          <div class="card-actions">
            <template v-if="item.status === '待接單'">
              <button class="delete-action-btn" @click.stop="handleDelete(item.serviceCode)">
                刪除委託
              </button>
            </template>

            <template v-else-if="item.status !== '待接單' && item.status !== '審核中' && item.status !== '審核失敗' && item.status !== '已完成'">
              <button class="view-receipt-btn" @click.stop="handleViewReceipt(item.serviceCode)">
                查看收據
              </button>

              <button
                  class="complete-action-btn"
                  :class="{ 'is-disabled': item.status !== '已寄出' }"
                  :disabled="item.status !== '已寄出'"
                  @click.stop="handleCompleteOrder(item.serviceCode)"
              >
                完成訂單
              </button>
            </template>

            <template v-else-if="item.status === '審核中'">
              <button class="delete-action-btn full-width" @click.stop="handleDelete(item.serviceCode)">
                刪除委託
              </button>
            </template>

            <template v-else-if="item.status === '審核失敗'">
              <button class="delete-action-btn full-width" @click.stop="handleDelete(item.serviceCode)">
                刪除失敗委託
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredCommissions.length === 0" class="empty-box">
      目前沒有相關的委託內容 (｡･ω･｡)
    </div>

    <div v-if="showReceiptModal" class="modal-overlay" @click="closeReceiptModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeReceiptModal">×</button>

        <h3 class="modal-title">委託收據憑證</h3>

        <div v-if="currentReceipt" class="receipt-body">
          <div class="receipt-img-box">
            <img
                :src="currentReceipt.receiptImageUrl ? ('http://127.0.0.1:5275' + currentReceipt.receiptImageUrl) : ''"
                alt="收據圖片"
                class="receipt-img"
            >
          </div>

          <div class="receipt-info">
            <p><strong>收據金額：</strong> <span class="price-text">JPY${{ currentReceipt.receiptAmount }}</span></p>
            <p><strong>收據日期：</strong> {{ formatDate(currentReceipt.uploadedAt) }}</p>
            <p v-if="currentReceipt.remark"><strong>備註說明：</strong> {{ currentReceipt.remark }}</p>
          </div>
        </div>
        <div v-else class="loading-text">
          讀取中...
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts" name="commissions-page">

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommissionStore } from '@/stores/commission';

const router = useRouter();
const store = useCommissionStore();

// --- 頁籤設定 ---
type TabType = 'waiting' | 'progress' | 'pending' | 'failed'|'all';
const currentTab = ref<TabType>('all');

const leftTabs: { id: TabType; label: string }[] = [
  { id: 'all', label: '全部委託' },
  { id: 'waiting', label: '待接單' },
  { id: 'progress', label: '進行中' }
];

const rightTabs: { id: TabType; label: string }[] = [
  { id: 'pending', label: '審核中' },
  { id: 'failed', label: '審核失敗' }
];

// --- 彈窗相關變數 ---
const showReceiptModal = ref(false);
const currentReceipt = ref<any>(null); // 暫存後端回傳的收據資料

// --- 初始化 ---
onMounted(() => {
  store.fetchUserManageCommissions();
});

// --- 篩選邏輯 ---
const filteredCommissions = computed(() => {
  return store.commissions.filter(item => {
    if (currentTab.value === 'all') return true;
    if (currentTab.value === 'waiting') return item.status === '待接單';
    if (currentTab.value === 'pending') return item.status === '審核中';
    if (currentTab.value === 'failed') return item.status === '審核失敗';

    // 進行中：排除掉上述狀態與已完成、取消
    if (currentTab.value === 'progress') {
      const excludeStatus = ['待接單', '審核中', '審核失敗', '已完成', 'cancelled'];
      return !excludeStatus.includes(item.status);
    }
    return false;
  });
});

// --- 工具函式 ---
const getStatusClass = (status: string) => {
  switch (status) {
    case '待接單': return 'status-waiting';
    case '審核中': return 'status-pending';
    case '審核失敗': return 'status-failed';
    default: return 'status-progress';
  }
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '無日期';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
};

// --- 操作函式 ---

// 1. 刪除委託
const handleDelete = async (serviceCode: string) => {
  if (confirm('確定要刪除這筆委託嗎？刪除後金額會退回您的錢包唷！ (´•̥̥̥ω•̥̥̥`)')) {
    try {
      const result = await store.deleteCommission(serviceCode);
      if (result?.success) {
        alert(result.message);
      }
    } catch (error: any) {
      alert(error.message || '刪除失敗，請稍後再試');
    }
  }
};

// 2. 完成訂單
const handleCompleteOrder = async (serviceCode: string) => {
  if (confirm('確定已收到商品並要完成訂單嗎？點擊後款項將會撥給小幫手唷！')) {
    try {
      const result = await store.completeCommission(serviceCode);
      if (result?.success) {
        alert('太棒了！訂單已完成，辛苦你囉！ (๑˃ᴗ˂)ﻭ');
        await store.fetchUserManageCommissions();
      }
    } catch (error: any) {
      alert(error.message || '操作失敗，請稍後再試');
    }
  }
};

// ✨ 3. 查看收據 (新功能)
const handleViewReceipt = async (serviceCode: string) => {
  try {
    // 呼叫 Store 的 API 動作 (請確保 Store 有寫這個 action)
    const data = await store.fetchCommissionReceipt(serviceCode);

    currentReceipt.value = data;
    showReceiptModal.value = true;
  } catch (error: any) {
    alert(error || '無法讀取收據資料，可能尚未上傳喔！');
  }
};

// 4. 關閉彈窗
const closeReceiptModal = () => {
  showReceiptModal.value = false;
  currentReceipt.value = null; // 清空避免閃爍
};

</script>

<style scoped>
.commissions-page {
  padding: 10px;
}

/* --- 切換鈕 --- */
.tab-switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 25px;
}
.tab-group {
  display: flex;
  background: #eee;
  padding: 4px;
  border-radius: 25px;
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

/* --- 網格 --- */
.commissions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* --- 卡片 --- */
.simple-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.simple-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: #fb7299;
}

.card-img-box {
  position: relative;
  height: 160px;
  background-color: #f8f8f8;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- 狀態標籤 --- */
.img-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 13px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 3;
}

/* --- 資訊內文 --- */
.card-info {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  color: #222;
  margin-bottom: 12px;
  height: 24px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.detail-row {
  display: flex;
  font-size: 13px;
  margin-bottom: 6px;
  line-height: 1.4;
}

.label {
  color: #9499a1;
  width: 70px;
  flex-shrink: 0;
}

.value {
  color: #222;
}

.price {
  color: #fb7299;
  font-weight: bold;
}

.date {
  color: #ff6699;
}

.failed-reason {
  margin-top: 10px;
  padding: 8px;
  background-color: #fff1f0;
  border-radius: 4px;
  font-size: 12px;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* --- 操作按鈕區域 --- */
.card-actions {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px dotted #eee;
  display: flex;
  gap: 8px;
}

.delete-action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  background: white;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.delete-action-btn:hover {
  background-color: #fff1f0;
  border-color: #ff4d4f;
}

.delete-action-btn.full-width {
  flex: 1 1 100%;
}

.view-receipt-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: white;
  border: 1px solid #00aeec;
  color: #00aeec;
  transition: 0.2s;
}

.view-receipt-btn:hover {
  background-color: #e6f7ff;
}

.complete-action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background-color: #fb7299;
  border: 1px solid #fb7299;
  color: white;
  transition: 0.2s;
}

.complete-action-btn.is-disabled {
  background-color: #e7e7e7;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.empty-box {
  padding: 100px 0;
  text-align: center;
  color: #bbb;
}

/* --- 狀態標籤顏色 --- */
.status-waiting { background-color: #fb7299; }
.status-pending { background-color: #ffb11b; }
.status-failed  { background-color: #9499a0; }
.status-progress { background-color: #00aeec; }

/* ✨ --- Modal 彈窗樣式 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.receipt-img-box {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}

.receipt-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.receipt-info p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.price-text {
  color: #fb7299;
  font-weight: bold;
  font-size: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>