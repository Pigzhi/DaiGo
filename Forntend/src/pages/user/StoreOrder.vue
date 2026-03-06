<template>
  <div class="orders-page">
    <h2 class="page-title">賣場訂單管理</h2>

    <div class="tab-switcher">
      <button
          v-for="tab in filterTabs"
          :key="tab.id"
          :class="['switch-btn', { active: filterStatus === tab.id }]"
          @click="filterStatus = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="orders-grid">
      <div
          v-for="order in displayOrders"
          :key="order.buyerOrderId"
          class="simple-card"
      >
        <div class="card-img-box">
          <img
              :src="order.productImage
              ? `http://localhost:5275${order.productImage}`
              : 'https://i.imgur.com/6VBx3io.png'"
              :alt="order.productName"
              class="product-img"
          >
          <span class="img-tag" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="card-info">
          <h3 class="product-name">{{ order.productName }}</h3>

          <div class="buyer-info">
            <p>買家：{{ order.receiverName }}</p>
            <p class="date">{{ formatDate(order.createdAt) }}</p>
          </div>

          <div class="order-footer">
            <div class="price-details">
              <p class="product-price">訂單金額：NT$ {{ order.totalAmount }}</p>
              <p class="income-text">數量：x {{ order.quantity }}</p>
            </div>
          </div>

          <div class="card-actions">
            <template v-if="order.status === 0">
              <button
                  class="ship-btn"
                  @click.stop="handleShip(order.buyerOrderId)"
              >
                安排出貨
              </button>
            </template>

            <template v-else-if="order.status === 1">
              <button class="ship-btn is-disabled" disabled>
                已出貨
              </button>
            </template>

            <template v-else-if="order.status === 2">
              <button class="ship-btn is-disabled" disabled>
                訂單完成
              </button>
            </template>

            <button
                class="detail-btn"
                @click.stop="handleViewDetail(order.buyerOrderId)"
            >
              詳細資訊
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="displayOrders.length === 0" class="empty-box">
      <p>目前沒有這個狀態的訂單紀錄 (｡･ω･｡)</p>
    </div>

    <div v-if="showShipModal" class="modal-overlay" @click.self="showShipModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>填寫出貨資訊 </h3>
          <button class="close-icon" @click="showShipModal = false">✕</button>
        </div>

        <div class="input-group">
          <label>物流公司 <span class="required">*</span></label>
          <input v-model="shipForm.LogisticsName" class="styled-input" placeholder="例如：黑貓、7-11、順豐" />
        </div>

        <div class="input-group">
          <label>物流追蹤單號 <span class="required">*</span></label>
          <input v-model="shipForm.TrackingNumber" class="styled-input" placeholder="請輸入物流單號" />
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showShipModal = false">取消</button>
          <button class="confirm-btn" @click="submitShip">確認出貨</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStoreStore } from "@/stores/store"; // 假設你用這個 Store

const storeStore = useStoreStore();
const currentOrderId = ref(0); // 紀錄當前操作的訂單 ID

// --- 1. 狀態篩選設定 ---
// 對應後端: 0=未出貨, 1=已出貨, 2=已完成
const filterStatus = ref<string | number>('all');

const filterTabs = [
  { id: 'all', label: '全部' },
  { id: 0, label: '未出貨' },
  { id: 1, label: '已出貨' },
  { id: 2, label: '已完成' }
];

// --- 2. 取得並篩選訂單 ---
// 這裡假設 storeStore.sellerOrders 裡存的是 API 回傳的訂單列表
const displayOrders = computed(() => {
  const allOrders = storeStore.sellerOrders || []; // 防止 null

  if (filterStatus.value === 'all') {
    return allOrders;
  }
  return allOrders.filter((order: any) => order.status === filterStatus.value);
});

// 頁面載入時呼叫 API
onMounted(async () => {
  // ✨ 之後我們要去 Store 補上這個 function
  await storeStore.fetchSellerOrders();
});

// --- 3. 出貨功能邏輯 ---
const showShipModal = ref(false);
const shipForm = ref({
  LogisticsName: '',
  TrackingNumber: ''
});

// 開啟出貨彈窗
const handleShip = (orderId: number) => {
  currentOrderId.value = orderId;
  shipForm.value = { LogisticsName: '', TrackingNumber: '' }; // 清空表單
  showShipModal.value = true;
};

// 送出出貨資訊
const submitShip = async () => {
  if (!shipForm.value.LogisticsName || !shipForm.value.TrackingNumber) {
    alert('請完整填寫物流資訊唷！(>_<)');
    return;
  }

  try {
    // ✨ 之後要去 Store 補上 shipOrder
    await storeStore.shipOrder(currentOrderId.value, shipForm.value);

    alert('出貨成功！✨');
    showShipModal.value = false;

    // 重新整理列表
    await storeStore.fetchSellerOrders();
  } catch (error: any) {
    alert(error.message || '出貨失敗，請稍後再試');
  }
};

// --- 4. 輔助小工具 ---
const handleViewDetail = (orderId: number) => {
  console.log('查看詳情 ID:', orderId);
  // router.push(`/orders/${orderId}`);
};

// 狀態文字轉換
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待出貨',
    1: '運送中',
    2: '已完成',
    3: '已取消'
  };
  return map[status] || '未知';
};

// 狀態顏色樣式
const getStatusClass = (status: number) => {
  if (status === 0) return 'tag-pending';
  if (status === 1) return 'tag-shipping';
  if (status === 2) return 'tag-done';
  return 'tag-gray';
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-TW');
};
</script>

<style scoped>
/* 這裡沿用你喜歡的樣式，我有微調讓它更適合賣家看訂單 */

.orders-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

.page-title {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

/* --- Tab 切換 --- */
.tab-switcher {
  display: flex;
  background: #f5f5f5;
  padding: 5px;
  border-radius: 30px;
  width: fit-content;
  margin-bottom: 30px;
}

.switch-btn {
  border: none;
  padding: 8px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  color: #777;
  background: transparent;
  transition: all 0.3s;
  font-weight: 500;
}

.switch-btn.active {
  background: white;
  color: #fb7299;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* --- 網格佈局 --- */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* --- 卡片樣式 --- */
.simple-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.simple-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border-color: #ffd6e0;
}

.card-img-box {
  position: relative;
  height: 180px;
  background-color: #f8f8f8;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 13px;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.tag-pending { background: #ff9800; } /* 橘色 */
.tag-shipping { background: #fb7299; } /* 粉色 */
.tag-done { background: #4caf50; }     /* 綠色 */
.tag-gray { background: #999; }

.card-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: bold;
  line-height: 1.4;

  /* 兩行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.buyer-info {
  font-size: 13px;
  color: #888;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.order-footer {
  margin-top: auto;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
  margin-bottom: 15px;
}

.price-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #fb7299;
  font-size: 17px;
  font-weight: bold;
}

.income-text {
  font-size: 14px;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 10px;
}

/* --- 按鈕樣式 --- */
.ship-btn, .detail-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  border: none;
}

/* 出貨按鈕 */
.ship-btn {
  background-color: #fb7299;
  color: white;
}

.ship-btn:hover:not(:disabled) {
  background-color: #ff85ad;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(251, 114, 153, 0.3);
}

.ship-btn.is-disabled {
  background-color: #f0f0f0;
  color: #bbb;
  cursor: default;
}

/* 詳情按鈕 */
.detail-btn {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
}

.detail-btn:hover {
  border-color: #fb7299;
  color: #fb7299;
  background: #fff5f8;
}

.empty-box {
  padding: 100px 0;
  text-align: center;
  color: #bbb;
  grid-column: 1 / -1;
}

/* Modal 彈窗樣式 (沿用) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.input-group { margin-bottom: 20px; }
.input-group label { display: block; margin-bottom: 8px; color: #555; font-weight: bold;}
.styled-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box; /* 重要 */
}
.modal-actions { display: flex; gap: 10px; }
.cancel-btn { flex: 1; padding: 12px; background: #eee; border: none; border-radius: 8px; cursor: pointer;}
.confirm-btn { flex: 2; padding: 12px; background: #fb7299; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;}

@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>