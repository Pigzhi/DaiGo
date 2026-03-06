<template>
  <div class="detail-container" v-if="commissionStore.currentCommission">
    <div class="detail-left">
      <img
          :src="commissionStore.currentCommission?.imageUrl
        ? `http://localhost:5275${commissionStore.currentCommission.imageUrl}`
        : 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg'"
          :alt="commissionStore.currentCommission?.title || '委託圖片'"
          class="main-image"
      >
    </div>

    <div class="detail-mid">
      <nav class="breadcrumb">委託編號：{{ commissionStore.currentCommission.serviceCode }}</nav>

      <h1 class="detail-title">{{ commissionStore.currentCommission.title }}</h1>

      <div class="price-section">
        <div class="price-row">
          <span class="currency">商品單價：{{ commissionStore.currentCommission.currency }}$</span>
          <span class="amount">{{ commissionStore.currentCommission.price }}</span>
        </div>

        <div class="price-row">
          <span class="label">委託數量：</span>
          <span class="qty">{{ commissionStore.currentCommission.quantity }} 件</span>
        </div>

<!--        <div class="fee-row">-->
<!--          <span class="label">平台服務費：</span>-->
<!--          <span class="value">- NT$ {{ commissionStore.currentCommission.fee }}</span>-->
<!--        </div>-->

        <div class="total-row">
          <span class="label">本件收入：</span>
          <span class="value highlight">NT$ {{ commissionStore.currentCommission.fee }}</span>
        </div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <span class="info-label">委託狀態</span>
          <span class="info-value status-tag">{{ commissionStore.currentCommission.status }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">截止日期</span>
          <span class="info-value">{{ formatDate(commissionStore.currentCommission.deadline) }}</span>
        </div>
      </div>

      <div class="description-box">
        <h3>委託詳細說明</h3>
        <p class="desc-text">{{ commissionStore.currentCommission.description || '無詳細說明' }}</p>
      </div>

      <div class="action-buttons">
        <button class="add-cart" @click="handleSendMessage">傳送訊息</button>
        <button
            class="buy-now"
            :class="{ 'disabled-btn': new Date() > new Date(commissionStore.currentCommission.deadline) }"
            :disabled="new Date() > new Date(commissionStore.currentCommission.deadline)"
            @click="handleAccept"
        >
          {{ new Date() > new Date(commissionStore.currentCommission.deadline) ? '已截止' : '確認接取委託' }}
        </button>
      </div>

      <button class="back-link" @click="$router.back()">〈 返回清單頁</button>
    </div>

    <div class="detail-right">
      <div class="map-header">
        <h3>建議購買地點：{{ commissionStore.currentCommission.location }}</h3>

        <a :href="commissionStore.currentCommission.mapUrl ?? undefined" target="_blank">
          <p>{{ commissionStore.currentCommission.fullAddress }}</p>
        </a>
      </div>
      <div ref="mapContainer" class="google-map-box"></div>
    </div>
  </div>

  <div v-else-if="commissionStore.loading" class="loading-state">
    <div class="spinner"></div>
    <p>正在從伺服器抓取最新委託資料...</p>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommissionStore } from '@/stores/commission'
import {useChatStore} from "@/stores/chatStores";
import {useAuthStore} from "@/stores/auth";


const route = useRoute()
const router = useRouter()
const commissionStore = useCommissionStore()
const chatStore  = useChatStore()
const authStore = useAuthStore()

// 使用 ref 建立地圖掛載點
const mapContainer = ref<HTMLElement | null>(null)

// 初始化地圖
// 初始化地圖
const initMap = () => {
  console.log('組件抓到的委託資料：', commissionStore.currentCommission);
  const data = commissionStore.currentCommission;

  // 1. 安全檢查：確保 SDK、容器以及經緯度資料都存在
  if (!mapContainer.value || !window.google || !data?.latitude || !data?.longitude) {
    console.warn('地圖初始化失敗：缺少座標資料或 Google SDK 未載入');
    return;
  }

  // 2. 將後端傳來的 decimal 轉換成 Google Maps 要求的 Number 格式
  const position = {
    lat: Number(data.latitude),
    lng: Number(data.longitude)
  };

  // 3. 建立地圖實例
  const map = new window.google.maps.Map(mapContainer.value as HTMLElement, {
    center: position,
    zoom: 16, // 稍微拉近一點，適合查看具體採買地點
    mapTypeControl: false, // 隱藏地圖/衛星切換，畫面更簡潔
  });

  // 4. 在地圖上放置圖釘 (Marker)
  new window.google.maps.Marker({
    position: position,
    map: map,
    title: data.title || '委託採買地點',
    animation: window.google.maps.Animation.DROP // 增加標記掉落動畫
  });
};

const handleSendMessage = async () => {
  const commission = commissionStore.currentCommission;

  // 1. 基本檢查
  if (!commission || !commission.creatorId) return;

  // 2. 檢查登入狀態
  if (!authStore.userId) { // 假設 id 存放在 authStore.user.id
    alert('請先登入才能傳送訊息喔！');
    // router.push('/login'); // 可以選擇要不要導向登入頁
    return;
  }

  // 3. 檢查是不是自己 (目前登入者 ID vs 委託建立者 ID)
  if (authStore.userId === commission.creatorId) {
    alert('這是你自己建立的委託，不能傳訊息給自己喔！(・∀・)');
    return;
  }

  try {
    // 4. 呼叫 Store 建立/取得聊天室
    // 這裡會把對方的 ID (creatorId) 傳給後端
    const result = await chatStore.createChatRoom(commission.creatorId);

    if (result && result.chatRoomId) {
      // 5. 成功拿到 ID 後，跳轉到聊天室頁面
      // 假設你的路由是 /chat/:id
      router.push(`/chat/${result.chatRoomId}`);
    }
  } catch (error) {
    console.error(error);
    alert('開啟聊天室失敗，請稍後再試 > <');
  }
}

onMounted(async () => {
  // 1. 從網址取得 ServiceCode (雖然路由參數名是 :id，但裡面存的是字串)
  const serviceCode = String(route.params.id)

  // 2. 呼叫我們剛寫好的 Action 去後端抓資料
  await commissionStore.fetchCommissionDetail(serviceCode)

  // 3. 資料抓到後，初始化地圖 (這部分稍後實作)
  if (commissionStore.currentCommission) {
    await nextTick();
    initMap();
  }
})

// 日期格式化工具
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '未定'
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

const handleAccept = async () => {
  // 1. 先確認資料是否存在
  const commission = commissionStore.currentCommission;
  if (!commission?.serviceCode) return;

  // ... (中間的日期檢查邏輯保持不變) ...
  if (commission.deadline) {
    const deadlineDate = new Date(commission.deadline).getTime();
    const now = Date.now();
    if (now > deadlineDate) {
      alert('哎呀！這筆委託已經超過截止日期，無法接單囉 (qwq)');
      return;
    }
  }

  // 2. 詢問使用者是否確定要接單
  if (!confirm(`確定要接取委託「${commission.title}」嗎？`)) return;

  try {
    // 3. 呼叫 Store 動作
    const result = await commissionStore.acceptCommission(commission.serviceCode);

    if (result.success) {
      alert('恭喜你！接單成功囉 🎉');

      // ✨✨✨ 修改這裡：接單成功後，跳轉回委託清單頁面 ✨✨✨
      router.push('/commissions');
    }
  } catch (err: any) {
    alert(err.message || '接單失敗，請稍後再試');
  }
}
</script>

<style scoped>
.detail-container {
  /* ✨ 優化點：放寬最大寬度，減少兩側留白 */
  max-width: 1800px;
  width: 98%;
  margin: 100px auto 40px;
  display: flex;
  gap: 30px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  /* ✨ 優化點：將框線改淡，視覺上更輕盈 */
  border: #eee 1px solid;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

/* 左側：圖片 - 固定寬度 */
.detail-left {
  /* ✨ 優化點：固定佔比空間，不隨視窗縮放 */
  flex: 0 0 450px;
  min-width: 450px;
}

.main-image {
  width: 100%;
  /* ✨ 優化點：設定固定寬高比 (如 4:5 或 1:1)，確保圖片佔位一致 */
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  object-fit: cover;
}

/* 中間：資訊 - 自動填滿剩餘空間 */
.detail-mid {
  flex: 1;
  /* ✨ 優化點：移除 max-width 限制，讓它隨容器展開 */
  max-width: none;
  display: flex;
  flex-direction: column;
}

/* 右側：地圖 - 佔據更多比例 */
.detail-right {
  /* ✨ 優化點：增加權重，讓地圖區塊更寬廣 */
  flex: 1.5;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #eee;
  /* ✨ 優化點：移除最大寬度限制 */
  max-width: none;
}

.google-map-box {
  width: 100%;
  /* ✨ 優化點：因容器變寬，高度可同步增加至 600px 比例較協調 */
  height: 600px;
  border-radius: 8px;
  margin-top: 15px;
}

.map-header h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.map-header p {
  font-size: 13px;
  color: #666;
  margin: 5px 0 10px;
}

/* 沿用 productDetail 的樣式設定 */
.detail-title {
  font-size: 26px;
  margin-bottom: 10px;
  color: #333;
}

.price-section {
  background: #fff5f7;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.currency { color: #fb7299; font-size: 14px; }
.amount { color: #fb7299; font-size: 30px; font-weight: bold; }

.info-list { margin-bottom: 20px; }
.info-item { display: flex; margin-bottom: 10px; font-size: 14px; }
.info-label { width: 80px; color: #999; }
.info-value { color: #333; }

.status-tag {
  background: #fb7299;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.action-buttons { display: flex; gap: 10px; margin-top: auto; padding-top: 20px; }
.add-cart, .buy-now {
  flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer;
}
.add-cart { background: #ffeef2; color: #fb7299; border: 1px solid #fb7299; }
.buy-now { background: #fb7299; color: white; border: none; }

.back-link { margin-top: 20px; background: none; border: none; color: #999; cursor: pointer; }
/* 修改這部分：讓每一行之間有舒適的間距 */
.price-row {
  display: flex;
  align-items: baseline; /* 讓文字底部對齊，看起來更整齊 */
  gap: 8px;              /* 標籤跟數值之間的距離 */
  margin-bottom: 8px;    /* 兩行之間的距離 */
}

/* 新增這部分：專門針對數量那一行的樣式 */
.qty {
  color: #333;           /* 數量用深色，跟價格的粉紅色區隔 */
  font-size: 18px;       /* 稍微大一點點，讓使用者一眼看清 */
  font-weight: 500;
}

.label {
  color: #666;           /* 「委託數量」標籤用灰色 */
  font-size: 14px;
}
</style>