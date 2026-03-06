<template>
  <div class="commissions-page">
    <aside class="filter-sidebar">
      <div class="filter-header">
        <span class="filter-title">進階篩選</span>
      </div>

      <div class="filter-group">
        <h4 class="group-title">關鍵字搜尋</h4>
        <div class="search-input-wrapper">
          <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜尋標題、內容..."
              class="side-search-input"
              @keyup.enter="handleFilterSearch"
          >
        </div>
      </div>

      <div class="filter-group">
        <h4 class="group-title">熱門地點</h4>
        <div class="location-tags">
          <button
              class="location-tag"
              :class="{ active: filterLocations === '' }"
              @click="selectLocation('')"
          >
            全部
          </button>

          <button
              v-for="loc in locationOptions"
              :key="loc.label"
              class="location-tag"
              :class="{ active: filterLocations === loc.value }"
              @click="selectLocation(loc.value)"
          >
            {{ loc.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <h4 class="group-title">排序方式</h4>
        <select v-model="currentSort" class="styled-select" @change="handleFilterSearch">
          <option value="fee_rate_desc">報酬率：高到低</option>
          <option value="price_asc">價格：低到高</option>
          <option value="price_desc">價格：高到低</option>
          <option value="deadline_asc">截止日：近到遠</option>
        </select>
      </div>

      <div class="filter-group">
        <h4 class="group-title">價格範圍</h4>
        <div class="price-range-inputs">
          <input type="number" v-model.number="minPrice" placeholder="最低" class="price-input">
          <span class="range-dash">-</span>
          <input type="number" v-model.number="maxPrice" placeholder="最高" class="price-input">
        </div>
      </div>

      <button class="apply-filter-btn" @click="handleFilterSearch">開始過濾</button>
      <button class="reset-btn" @click="resetFilters">清空條件</button>
    </aside>

    <div class="main-list">
      <div class="header">
        <h2 class="title">委託清單</h2>
        <p class="count">共 {{ commissionStore.commissions.length }} 件</p>
      </div>

      <div class="commission-grid">
        <div v-for="item in commissionStore.commissions"
             :key="item.commissionId"
             class="commission-card"
             @click="goToDetail(item.serviceCode)">
          <div class="card-image">
              <img :src="item.imageUrl ? `http://localhost:5275${item.imageUrl}` : 'https://i.imgur.com/6VBx3io.png'"
                   alt="商品圖">
            <div class="status-tag">{{item.status}}</div>
            <div class="fee-rate-tag">{{ calculateFeeRate(item) }}%</div>
          </div>

          <div class="card-body">
            <h3 class="item-name">{{ item.title }}</h3>
            <div class="info-row">
              <span class="value price">{{item?.currency}}$ {{ formatNumber(item.price) }}</span>
            </div>
            <div class="info-row">
              <span class="label">報酬:</span>
              <span class="value fee">NT$ {{ formatNumber(item.fee) }} ({{ calculateFeeRate(item) }}%)</span>
            </div>
            <div class="info-row">
              <span class="value">{{ item.location || '不限地點' }}</span>
            </div>
            <div class="info-row">
              <span class="value date">截止：{{ formatDate(item.deadline) }}</span>
            </div>
            <button class="accept-btn">接取委託</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="commissionsView">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCommissionStore } from '@/stores/commission';

const router = useRouter();
const route = useRoute();
const commissionStore = useCommissionStore();

// --- 狀態變數 ---
const searchKeyword = ref((route.query.keyword as string) || '');
const currentSort = ref('fee_rate_desc');
const filterLocations = ref<string>(''); // 這裡存的是 "tokyo,東京" 這樣的字串
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);

// --- 匯率設定 (計算顯示用) ---
const exchangeRate: { [key: string]: number } = {
  JPY: 0.201,
  TWD: 1,
  USD: 32.5
};

// --- ✨ 修改: 地點選項 (Value 改成中英文並存) ---
const locationOptions = [
  { label: '東京', value: 'tokyo,東京' },
  { label: '北海道', value: 'hokkaido,北海道' },
  { label: '京都', value: 'kyoto,京都' },
  { label: '大阪', value: 'osaka,大阪' }
];

// --- 初始化 ---
onMounted(async () => {
  const keyword = (route.query.keyword as string) || '';
  // 初始載入時，如果有網址參數就帶入
  searchKeyword.value = keyword;

  await handleFilterSearch();
});

// --- 格式化工具 ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-TW');
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  return num.toLocaleString();
};

// 計算報酬率: Fee / (Price * 匯率) * 100
const calculateFeeRate = (item: any) => {
  if (!item.price || !item.fee) return '0.0';
  const rate = exchangeRate[item.currency] || 1;
  const feeRate = (item.fee / (item.price * rate)) * 100;
  return feeRate.toFixed(1);
};

// 跳轉詳情頁
const goToDetail = (code: string) => {
  router.push(`/commissions/${code}`);
};

// --- 監聽網址變化 (支援瀏覽器上一頁/下一頁) ---
watch(() => route.query.keyword, (newKeyword) => {
  searchKeyword.value = (newKeyword as string) || '';
  handleFilterSearch();
});

// --- ✨ 修改: 選擇地點邏輯 ---
const selectLocation = (val: string) => {
  // 邏輯: 如果點擊的是「目前已選中」的，就取消選取 (變回空字串)
  // 如果點擊的是「全部」，傳進來的 val 會是 ''，也符合這個邏輯
  if (filterLocations.value === val && val !== '') {
    filterLocations.value = '';
  } else {
    filterLocations.value = val;
  }

  // 🔥 重點: 點擊後立即觸發搜尋，不用再按按鈕
  handleFilterSearch();
};

// --- 清空篩選條件 ---
const resetFilters = () => {
  searchKeyword.value = '';
  currentSort.value = 'fee_rate_desc';
  filterLocations.value = ''; // 清空地點
  minPrice.value = null;
  maxPrice.value = null;

  // 清空後馬上重新搜尋
  handleFilterSearch();
};

// --- 執行搜尋 (呼叫 Store) ---
const handleFilterSearch = async () => {
  const params = {
    keyword: searchKeyword.value,
    location: filterLocations.value, // 這裡會送出 "osaka,大阪" 或是 ""
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    sort: currentSort.value
  };

  await commissionStore.fetchCommissions(params);
};
</script>

<style scoped>
.commissions-page {
  max-width: 98%;
  margin: 110px auto 40px;
  padding: 0 10px;
  display: flex;
  gap: 30px;
}

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
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: 0.2s;
}

.checkbox-container input {
  margin-right: 10px;
  cursor: pointer;
  accent-color: #fb7299;
}

.checkbox-container:hover {
  color: #fb7299;
}

.price-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
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

.commission-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.commission-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s;
  cursor: pointer;
}

.commission-card:hover {
  transform: translateY(-5px);
}

.card-image {
  height: 160px;
  position: relative;
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
}

.fee-rate-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fb7299;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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
  font-size: 13px;
  color: #999;
  margin-right: 5px;
}

.price {
  color: #fb7299;
  font-weight: bold;
  font-size: 16px;
}

.fee {
  color: #fb7299;
  font-weight: 700;
  font-size: 14px;
}

.accept-btn {
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

.accept-btn:hover {
  background: #fb7299;
  color: white;
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

.search-input-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2px;
}

/* ✨ 新增：地點標籤容器 */
.location-tags {
  display: flex;
  flex-wrap: wrap; /* 超過寬度自動換行 */
  gap: 8px;        /* 按鈕之間的間距 */
}

/* ✨ 新增：標籤按鈕樣式 */
.location-tag {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  background-color: white;
  border-radius: 20px; /* 圓角看起來比較親切 */
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

/* 滑鼠移過去的效果 */
.location-tag:hover {
  border-color: #fb7299;
  color: #fb7299;
  background-color: #fff0f5;
}

/* ✨ 被選中時的樣式 (Active) */
.location-tag.active {
  background-color: #fb7299;
  color: white;
  border-color: #fb7299;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(251, 114, 153, 0.3);
}
</style>
