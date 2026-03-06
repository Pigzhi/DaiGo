<template>
  <div class="product-page">
    <!-- 側邊篩選欄 -->
    <aside class="filter-sidebar">
      <div class="filter-header">
        <span class="filter-title">進階篩選</span>
      </div>

      <!-- 關鍵字搜尋 -->
      <div class="filter-group">
        <h4 class="group-title">關鍵字搜尋</h4>
        <div class="search-input-wrapper">
          <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜尋商品名稱..."
              class="side-search-input"
          >
        </div>
      </div>

      <!-- 排序方式 -->
      <div class="filter-group">
        <h4 class="group-title">排序方式</h4>
        <select v-model="currentSort" class="styled-select">
          <option value="">預設排序</option>
          <option value="price_asc">價格:低到高</option>
          <option value="price_desc">價格:高到低</option>
          <option value="deadline_asc">截止日:近到遠</option>
          <option value="newest">最新上架</option>
        </select>
      </div>

      <!-- 商品分類 -->
      <div class="filter-group">
        <h4 class="group-title">商品分類</h4>
        <ul class="filter-list">
          <li v-for="cat in categoryOptions" :key="cat.value" class="filter-item">
            <label class="checkbox-container">
              <input
                  type="radio"
                  name="category-group"
                  :value="cat.value"
                  v-model="filterCategory"
              >
              <span class="checkmark"></span>
              {{ cat.label }}
            </label>
          </li>
        </ul>
      </div>

      <!-- 熱門地點 -->
      <div class="filter-group">
        <h4 class="group-title">熱門地點</h4>
        <ul class="filter-list">
          <li v-for="loc in locationOptions" :key="loc.value" class="filter-item">
            <label class="checkbox-container">
              <input
                  type="radio"
                  name="location-group"
                  :value="loc.value"
                  v-model="filterLocation"
              >
              <span class="checkmark"></span>
              {{ loc.label }}
            </label>
          </li>
        </ul>
      </div>

      <!-- 價格範圍 -->
      <div class="filter-group">
        <h4 class="group-title">價格範圍</h4>
        <div class="price-range-inputs">
          <input
              type="number"
              v-model.number="minPrice"
              placeholder="最低"
              class="price-input"
          >
          <span class="range-dash">-</span>
          <input
              type="number"
              v-model.number="maxPrice"
              placeholder="最高"
              class="price-input"
          >
        </div>
      </div>

      <button class="apply-filter-btn" @click="handleFilterSearch">開始過濾</button>
      <button class="reset-btn" @click="resetFilters">清空條件</button>
    </aside>

    <!-- 主要商品列表區 -->
    <div class="main-list">
      <div class="header">
        <h2 class="title">熱門商品</h2>
        <p class="count">共 {{ productStore.products.length }} 件商品</p>
      </div>

      <div class="product-grid">
        <div
            v-for="item in productStore.products"
            :key="item.id"
            class="product-card"
            @click="goToDetail(item.id)"
        >
          <div class="card-image">
            <img
                :src="item.image ? `http://localhost:5275${item.image}` : 'https://i.imgur.com/6VBx3io.png'"
                :alt="item.name"
            >
            <div class="status-tag">{{ item.status || '販售中' }}</div>
          </div>

          <div class="card-body">
            <h3 class="item-name">{{ item.name }}</h3>

            <!-- 價格 -->
            <div class="info-row">
              <span class="value price">NT$ {{ formatNumber(item.price) }}</span>
            </div>

            <!-- 分類 -->
            <div class="info-row">
              <span class="label">分類:</span>
              <span class="value">{{ item.category || '一般商品' }}</span>
            </div>

            <!-- 地點 -->
            <div class="info-row">
              <span class="label">地點:</span>
              <span class="value">{{ item.location || '不限地點' }}</span>
            </div>

            <!-- 截止時間 -->
            <div class="info-row">
              <span class="label">截止:</span>
              <span class="value date">{{ formatDate(item.deadline) }}</span>
            </div>

            <button class="buy-btn" @click.stop="addToCart(item.id)">
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ProductView">
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/product';
import { useRouter, useRoute } from 'vue-router';
import {useStoreStore} from "@/stores/store";

const router = useRouter();
const route = useRoute();

// 初始化變數
const searchKeyword = ref((route.query.keyword as string) || '');
const currentSort = ref('');
const filterCategory = ref<string>('');
const filterLocation = ref<string>('');
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);

// 初始化 Store
const productStore = useProductStore();
const storeControl= useStoreStore();

// 商品分類選項
const categoryOptions = [
  { label: '全部分類', value: '' },
  { label: '電子產品', value: 'electronics' },
  { label: '服飾配件', value: 'fashion' },
  { label: '生活用品', value: 'lifestyle' },
  { label: '美妝保養', value: 'beauty' }
];

// 地點選項
const locationOptions = [
  { label: '全部地點', value: '' },
  { label: '東京', value: 'tokyo' },
  { label: '大阪', value: 'osaka' },
  { label: '北海道', value: 'hokkaidao' },
  { label: '京都', value: 'kyoto' },
  // { label: '不限地點', value: 'anywhere' }
];

// 頁面載入時抓取商品資料
onMounted(async () => {
  try {
    const products = await storeControl.fetchAllProducts();
    productStore.products = products; // 把資料放到你的 productStore 裡
  } catch (error) {
    console.error('載入商品失敗:', error);
  }
});

// 格式化數字(加千分位)
const formatNumber = (num: number) => {
  if (!num) return '0';
  return num.toLocaleString();
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '無期限';
  return new Date(dateStr).toLocaleDateString('zh-TW');
};

// 前往商品詳情頁
const goToDetail = (id: number) => {
  router.push(`/product/${id}`);
};

// 加入購物車
const addToCart = (id: number) => {
  alert(`已將商品 ${id} 加入購物車!`);
};

// 執行篩選搜尋
const handleFilterSearch = async () => {
  const params = {
    keyword: searchKeyword.value,
    category: filterCategory.value,
    location: filterLocation.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    sort: currentSort.value
  };

  await productStore.fetchProducts(params);
};

// 清空所有篩選條件
const resetFilters = () => {
  searchKeyword.value = '';
  currentSort.value = '';
  filterCategory.value = '';
  filterLocation.value = '';
  minPrice.value = null;
  maxPrice.value = null;
  handleFilterSearch();
};

// 監聽網址參數變化
watch(() => route.query.keyword, (newKeyword) => {
  productStore.fetchProducts({
    keyword: (newKeyword as string) || ''
  });
});
</script>

<style scoped>
/* ===== 頁面整體佈局 ===== */
.product-page {
  max-width: 95%;
  margin: 110px auto 40px;
  padding: 0 10px;
  display: flex;
  gap: 30px;
}

/* ===== 側邊篩選欄 ===== */
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  align-self: flex-start;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 25px;
  color: #333;
}

.filter-group {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.group-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #222;
  font-weight: 600;
}

/* 搜尋輸入框 */
.search-input-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2px;
}

.side-search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: #f9f9f9;
}

.side-search-input:focus {
  border-color: #fb7299;
  background-color: white;
}

/* 下拉選單 */
.styled-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #444;
  outline: none;
  cursor: pointer;
}

.styled-select:focus {
  border-color: #fb7299;
}

/* 篩選清單 */
.filter-list {
  list-style: none;
  padding: 0;
}

.filter-item {
  margin-bottom: 10px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-container input {
  cursor: pointer;
  accent-color: #fb7299;
}

.checkbox-container:hover {
  color: #fb7299;
}

/* 價格輸入區 */
.price-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.price-input:focus {
  border-color: #fb7299;
}

.range-dash {
  color: #999;
}

/* 按鈕 */
.apply-filter-btn {
  width: 100%;
  padding: 10px;
  background-color: #fb7299;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.apply-filter-btn:hover {
  background-color: #ff85a2;
}

.reset-btn {
  width: 100%;
  background: transparent;
  border: none;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  margin-top: 10px;
}

.reset-btn:hover {
  color: #fb7299;
}

/* ===== 主要商品列表區 ===== */
.main-list {
  flex: 1;
}

.header {
  margin-bottom: 30px;
  border-left: 6px solid #fb7299;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title {
  font-size: 26px;
  color: #333;
}

.count {
  color: #999;
  margin-top: 5px;
}

/* 商品網格佈局 (一排四個) */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 商品卡片 */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
  cursor: pointer;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-5px);
  border-color: #fb7299;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.card-image {
  height: 180px;
  position: relative;
  background-color: #f8f8f8;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #fb7299;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.card-body {
  padding: 15px;
}

.item-name {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
  height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.info-row .label {
  font-weight: 500;
  color: #888;
  margin-right: 5px;
  min-width: 45px;
}

.info-row .value {
  color: #555;
}

.price {
  color: #fb7299 !important;
  font-weight: bold !important;
  font-size: 18px !important;
}

.date {
  color: #999;
}

.buy-btn {
  width: 100%;
  margin-top: 10px;
  background: #ffeef2;
  color: #fb7299;
  border: 1px solid #fb7299;
  padding: 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn:hover {
  background: #fb7299;
  color: white;
}

/* ===== 響應式設計 ===== */
@media (max-width: 1400px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-page {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    position: static;
    max-height: none;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
