<template>
  <div class="orders-page">
    <h2 class="page-title">我的購買清單</h2>

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
          <div class="store-name">
            <i class="icon-store">🏪</i> {{ order.storeName }}
          </div>

          <h3 class="product-name">{{ order.productName }}</h3>

          <div class="order-details">
            <p class="detail-row">
              <span>下單日期</span>
              <span>{{ formatDate(order.createdAt) }}</span>
            </p>
            <p class="detail-row" v-if="order.logisticsName">
              <span>物流公司</span>
              <span>{{ order.logisticsName }}</span>
            </p>
            <p class="detail-row" v-if="order.trackingNumber">
              <span>物流單號</span>
              <span class="tracking-num">{{ order.trackingNumber }}</span>
            </p>
          </div>

          <div class="order-footer">
            <div class="price-box">
              <span class="label">總金額</span>
              <span class="price">NT$ {{ order.totalAmount }}</span>
            </div>

            <div class="action-box">

              <button
                  v-if="order.status === 1"
                  class="complete-btn"
                  @click="handleComplete(order.buyerOrderId)"
              >
                完成訂單
              </button>

              <span v-else-if="order.status === 0" class="status-text pending">
                等待賣家出貨...
              </span>

              <span v-else-if="order.status === 2" class="status-text done">
                交易已完成
              </span>

            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="displayOrders.length === 0" class="empty-box">
      <p>這裡空空的，快去逛逛吧！(｡･ω･｡)</p>
      <router-link to="/products" class="go-shop-btn">去購物 ➤</router-link>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStoreStore } from "@/stores/store";

const storeStore = useStoreStore();

// --- 1. 狀態篩選 ---
const filterStatus = ref<string | number>('all');
const filterTabs = [
  { id: 'all', label: '全部訂單' },
  { id: 0, label: '待出貨' },
  { id: 1, label: '待收貨' }, // 這裡就是買家最關心的狀態
  { id: 2, label: '已完成' }
];

// --- 2. 取得資料與篩選 ---
const displayOrders = computed(() => {
  const allOrders = storeStore.buyerOrders || []; // 先假設 Store 會有這個變數

  if (filterStatus.value === 'all') {
    return allOrders;
  }
  return allOrders.filter((order: any) => order.status === filterStatus.value);
});

// 頁面載入時抓資料
onMounted(async () => {
  // ✨ 這支 API 我們等一下要去後端寫
  await storeStore.fetchBuyerOrders();
});

// --- 3. 完成訂單邏輯 ---
const handleComplete = async (orderId: number) => {
  const confirm = window.confirm('確認您已經收到商品了嗎？\n按下確認後將完成訂單並撥款給賣家。');

  if (!confirm) return;

  try {
    // ✨ 這支動作我們等一下要去 Store 寫
    await storeStore.completeOrder(orderId);

    alert('訂單完成！感謝您的購買 (≧∇≦)/');

    // 重新抓取資料更新畫面
    await storeStore.fetchBuyerOrders();

  } catch (error: any) {
    alert(error.message || '操作失敗，請稍後再試');
  }
};

// --- 4. 輔助小工具 ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-TW');
};

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '處理中',
    1: '運送中',
    2: '已完成',
    3: '已取消'
  };
  return map[status] || '未知';
};

const getStatusClass = (status: number) => {
  if (status === 0) return 'tag-pending';
  if (status === 1) return 'tag-shipping';
  if (status === 2) return 'tag-done';
  return 'tag-gray';
};
</script>

<style scoped>
.orders-page {
  max-width: 98%;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

.page-title {
  color: #333;
  font-size: 26px;
  margin-bottom: 25px;
  font-weight: 800;
}

/* Tab 切換 */
.tab-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.switch-btn {
  border: none;
  background: none;
  font-size: 16px;
  color: #888;
  padding: 8px 16px;
  cursor: pointer;
  position: relative;
  font-weight: 600;
  transition: all 0.3s;
}

.switch-btn.active {
  color: #fb7299;
}

.switch-btn.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #fb7299;
  border-radius: 3px;
}

/* 列表區塊 */
.orders-grid {
  display: grid; /* ✨ 改成網格 */
  grid-template-columns: repeat(2, 1fr); /* ✨ 關鍵咒語：切成兩等份 */
  gap: 20px;
}

/* 卡片樣式 */
.simple-card {
  display: flex;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.simple-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border-color: #ffdce5;
}

/* 左側圖片 */
.card-img-box {
  width: 160px;
  height: 160px;
  position: relative;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
}

.tag-pending { background: #ff9800; }
.tag-shipping { background: #fb7299; }
.tag-done { background: #4caf50; }

/* 右側資訊 */
.card-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.store-name {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
}

.order-details {
  font-size: 14px;
  color: #666;
  margin-bottom: auto; /* 推擠 footer 到最下面 */
}

.detail-row {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
}

.tracking-num {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.order-footer {
  border-top: 1px solid #f9f9f9;
  padding-top: 15px;
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-box .label { font-size: 13px; color: #999; }
.price-box .price { font-size: 20px; color: #fb7299; font-weight: bold; }

/* 按鈕與狀態文字 */
.action-box {
  display: flex;
  align-items: center;
}

.complete-btn {
  background: linear-gradient(135deg, #fb7299 0%, #ff85ad 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(251, 114, 153, 0.3);
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(251, 114, 153, 0.4);
}

.status-text {
  font-size: 14px;
  font-weight: bold;
}
.status-text.pending { color: #ff9800; }
.status-text.done { color: #4caf50; }

/* 手機版 RWD */
@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr; /* ✨ 手機畫面小，變回一欄才不會太擠 */
  }

  /* 下面這些是你原本就有的，保留就好 */
  .simple-card { flex-direction: column; }
  .card-img-box { width: 100%; height: 200px; }
  .order-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
  .action-box { width: 100%; justify-content: flex-end; }
}

.empty-box {
  text-align: center;
  padding: 60px 0;
  color: #bbb;
}

.go-shop-btn {
  display: inline-block;
  margin-top: 15px;
  color: #fb7299;
  text-decoration: none;
  font-weight: bold;
  border: 1px solid #fb7299;
  padding: 8px 20px;
  border-radius: 20px;
}
</style>