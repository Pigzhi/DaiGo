<template>
  <div class="detail-container" v-if="product">
    <!-- 左側：商品圖片 -->
    <div class="detail-left">
      <img
          :src="product.image ? `http://localhost:5275${product.image}` : 'https://i.imgur.com/6VBx3io.png'"
          :alt="product.name"
          class="main-image"
      >
    </div>

    <!-- 中間：商品資訊 -->
    <div class="detail-mid">
      <nav class="breadcrumb">商品編號：{{ product.id }}</nav>

      <h1 class="detail-title">{{ product.name }}</h1>

      <div class="price-section">
        <div class="price-row">
          <span class="currency">商品單價：NT$</span>
          <span class="amount">{{ formatNumber(product.price) }}</span>
        </div>

        <div class="price-row">
          <span class="label">庫存數量：</span>
          <span class="qty">{{ product.quantity || 0 }} 件</span>
        </div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <span class="info-label">商品分類</span>
          <span class="info-value">{{ product.category || '一般商品' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">商品狀態</span>
          <span class="info-value status-tag">{{ product.status || '販售中' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">商品地點</span>
          <span class="info-value">{{ product.location || '不限地點' }}</span>
        </div>
        <div class="info-item" v-if="product.deadline">
          <span class="info-label">截止日期</span>
          <span class="info-value">{{ formatDate(product.deadline) }}</span>
        </div>
      </div>

      <div class="description-box">
        <h3>商品詳細說明</h3>
        <p class="desc-text">{{ product.description || '無詳細說明' }}</p>
      </div>

      <div class="action-buttons">
<!--        <button-->
<!--            class="add-cart"-->
<!--            :class="{ 'disabled-btn': isExpired }"-->
<!--            :disabled="isExpired"-->
<!--        >-->
<!--          {{ isExpired ? '加入購物車' : '加入購物車' }}-->
<!--        </button>-->

        <button
            class="buy-now"
            :class="{ 'disabled-btn': isExpired }"
            :disabled="isExpired"
            @click="buyNow"
        >
          {{ isExpired ? '已截止' : '立即購買' }}
        </button>
      </div>

      <button class="back-link" @click="$router.back()">〈 返回清單頁</button>
    </div>

    <!-- 右側：賣場資訊卡片 -->
    <div class="detail-right">
      <div class="store-card">
        <div class="store-header">
          <img
              :src="product.storeInfo?.image ? `http://localhost:5275${product.storeInfo.image}` : 'https://i.imgur.com/6VBx3io.png'"
              :alt="product.storeInfo?.name"
              class="store-avatar"
          >
          <div class="store-info">
            <h3 class="store-name">{{ product.storeInfo?.name || '賣場名稱' }}</h3>
            <p class="store-desc">{{ product.storeInfo?.description || '暫無賣場簡介' }}</p>
          </div>
        </div>

        <div class="store-stats">
          <div class="stat-item">
            <span class="stat-label">商品數量</span>
            <span class="stat-value">{{ storeProductCount }}</span>
          </div>
<!--          <div class="stat-item">-->
<!--            <span class="stat-label">評價分數</span>-->
<!--            <span class="stat-value">5.0 ⭐</span>-->
<!--          </div>-->
        </div>

        <button class="visit-store-btn" @click="goToStore">
          前往賣場
        </button>

        <button class="contact-btn" @click="contactSeller">
          聯絡賣家
        </button>
      </div>

      <!-- 地點資訊區 -->
      <div class="location-card" v-if="product.placeDetails">
        <h3 class="location-title">📍 商品地點</h3>
        <p class="location-name">{{ product.placeDetails.name }}</p>
        <p class="location-address">{{ product.placeDetails.address }}</p>
        <a
            v-if="product.placeDetails.mapUrl"
            :href="product.placeDetails.mapUrl"
            target="_blank"
            class="map-link"
        >
          在 Google Maps 中查看
        </a>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>正在載入商品資料...</p>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()

const product = ref<any>(null)
const loading = ref(false)
const storeProductCount = ref(0)

const isExpired = computed(() => {
  if (!product.value?.deadline) return false
  return new Date() > new Date(product.value.deadline)
})

// 格式化數字(加千分位)
const formatNumber = (num: number) => {
  if (!num) return '0'
  return num.toLocaleString()
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '無期限'
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// 立即購買
// 修改：立即购买函数
const buyNow = () => {
  // 1. 先检查是否过期
  if (isExpired.value) {
    alert('哎呀！这个商品已经超过截止日期，无法购买啰 (qwq)')
    return
  }

  // 2. 原本的跳转逻辑
  if (product.value) {
    router.push(`/checkout/${product.value.id}`)
  }
}

// 前往賣場
const goToStore = () => {
  if (product.value?.storeInfo?.storeId) {
    router.push(`/store/${product.value.storeInfo.storeId}`)
  }
}

// 聯絡賣家
const contactSeller = () => {
  alert('聯絡賣家功能開發中~')
}

// 頁面載入時抓取商品詳情
onMounted(async () => {
  loading.value = true
  try {
    const productId = Number(route.params.id)
    product.value = await storeStore.fetchProductDetail(productId)

    // 如果需要的話,可以再抓取該賣場的商品數量
    if (product.value?.storeInfo?.storeId) {
      const storeProducts = await storeStore.fetchStoreProducts(product.value.storeInfo.storeId)
      storeProductCount.value = storeProducts.products?.length || 0
    }
  } catch (error) {
    console.error('載入失敗:', error)
    alert('商品不存在或已下架')
    router.back()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-container {
  max-width: 1900px;
  width: 98%;
  margin: 110px auto 40px;
  display: flex;
  gap: 30px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  border: #eee 1px solid;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

/* 左側：商品圖片 */
.detail-left {
  flex: 0 0 450px;
  min-width: 450px;
}

.main-image {
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  object-fit: cover;
}

/* 中間：商品資訊 */
.detail-mid {
  flex: 1;
  max-width: none;
  display: flex;
  flex-direction: column;
}

.breadcrumb {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.detail-title {
  font-size: 26px;
  margin-bottom: 20px;
  color: #333;
}

.price-section {
  background: #fff5f7;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.currency {
  color: #fb7299;
  font-size: 14px;
}

.amount {
  color: #fb7299;
  font-size: 30px;
  font-weight: bold;
}

.label {
  color: #666;
  font-size: 14px;
}

.qty {
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.info-list {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-label {
  width: 80px;
  color: #999;
}

.info-value {
  color: #333;
}

.status-tag {
  background: #fb7299;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.description-box {
  margin-bottom: 20px;
}

.description-box h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.desc-text {
  line-height: 1.6;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 20px;
}

.add-cart, .buy-now {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
}

.add-cart {
  background: #ffeef2;
  color: #fb7299;
  border: 1px solid #fb7299;
}

.add-cart:hover {
  background: #fb7299;
  color: white;
}

.buy-now {
  background: #fb7299;
  color: white;
  border: none;
}

.buy-now:hover {
  background: #ff85a2;
  transform: translateY(-2px);
}

.back-link {
  margin-top: 20px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.back-link:hover {
  color: #fb7299;
}

/* 右側：賣場資訊卡片 */
.detail-right {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.store-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.store-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.store-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fb7299;
}

.store-info {
  flex: 1;
}

.store-name {
  font-size: 16px;
  color: #333;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.store-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.store-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.visit-store-btn, .contact-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.visit-store-btn {
  background: #fb7299;
  color: white;
  border: none;
}

.visit-store-btn:hover {
  background: #ff85a2;
  transform: translateY(-2px);
}

.contact-btn {
  background: white;
  color: #fb7299;
  border: 1px solid #fb7299;
}

.contact-btn:hover {
  background: #ffeef2;
}

/* 地點資訊卡片 */
.location-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.location-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
}

.location-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.location-address {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.map-link {
  display: inline-block;
  font-size: 13px;
  color: #fb7299;
  text-decoration: none;
  border-bottom: 1px solid #fb7299;
}

.map-link:hover {
  color: #ff85a2;
  border-color: #ff85a2;
}

/* 載入狀態 */
.loading-state {
  max-width: 1800px;
  margin: 150px auto;
  text-align: center;
  color: #999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #fb7299;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .detail-container {
    flex-direction: column;
  }

  .detail-left, .detail-right {
    flex: none;
    width: 100%;
    max-width: 100%;
  }
}
/* ... 原本的 CSS ... */

/* ✨ 新增：禁用按钮样式 */
.disabled-btn {
  background-color: #ccc !important;
  border-color: #ccc !important;
  color: #666 !important;
  cursor: not-allowed !important;
  transform: none !important; /* 移除悬浮动画 */
  box-shadow: none !important;
}

/* 确保原本的 hover 效果不会覆盖这个样式 */
.disabled-btn:hover {
  background-color: #ccc !important;
  color: #666 !important;
}
</style>
