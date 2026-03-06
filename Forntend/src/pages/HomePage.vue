<template>
  <div class="home-page">

    <section class="hero-section">
      <div class="hero-bg">
        <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2574&auto=format&fit=crop" alt="Japan Street" />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <h1 class="main-title">你的日本願望清單</h1>
        <p class="sub-title">發布委託讓小幫手幫你帶回,或是接取任務賺取旅費</p>

        <div class="hero-actions">
          <button class="action-btn primary" @click="router.push('/create-commission')">
            <span class="btn-text">發布委託代購</span>
            <span class="btn-sub">我想要買東西</span>
          </button>
          <button class="action-btn secondary" @click="router.push('/commissions')">
            <span class="btn-text">接取委託任務</span>
            <span class="btn-sub">順路賺取酬勞</span>
          </button>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-num">1,208</span>
          <span class="stat-label">進行中委託</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">NT$ 580萬</span>
          <span class="stat-label">累積成交金額</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">98%</span>
          <span class="stat-label">任務完成率</span>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">急需小幫手-精選委託</h2>
          <p class="section-desc">有人可能需要您的協助</p>
        </div>
        <button class="view-more-btn" @click="router.push('/commissions')">查看全部委託</button>
      </div>

      <div class="commissions-grid">
        <div
            v-for="item in commissionStore.hotCommissions"
            :key="item.serviceCode"
            class="simple-card commission-card-style"
            @click="router.push(`/commissions/${item.serviceCode}`)"
        >
          <div class="card-img-box">
            <img :src="getImageUrl(item.imageUrl)" :alt="item.title" class="product-img">
            <span class="img-tag">{{ item.location }}</span>
            <span class="fee-rate-badge">{{ formatFeeRate(item.feeRate) }}%</span>
          </div>

          <div class="card-info">
            <h3 class="product-name">{{ item.title }}</h3>

            <div class="detail-row">
              <span class="label">商品價格</span>
              <span class="value price">{{ item.currency }} {{ formatNumber(item.price) }}</span>
            </div>

            <div class="detail-row">
              <span class="label">截止日期</span>
              <span class="value date">{{ formatDate(item.deadline) }}</span>
            </div>

            <div class="detail-row">
              <span class="label">報酬</span>
              <span class="value reward">NT$ {{ formatNumber(item.fee) }}</span>
            </div>

            <div class="card-actions">
              <button class="accept-action-btn">立即接單</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container bg-light">
      <div class="section-header center">
        <h2 class="section-title">熱門代購地區</h2>
        <p class="section-desc">你正要前往這些地方嗎?看看有什麼順路委託</p>
      </div>

      <div class="region-grid">
        <div class="region-card" @click="filterRegion('tokyo')">
          <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" alt="Tokyo">
          <div class="region-overlay">
            <span class="region-name">東京</span>
            <span class="region-count">342 件委託</span>
          </div>
        </div>
        <div class="region-card" @click="filterRegion('osaka')">
          <img src="https://static.gltjp.com/glt/data/article/21000/20172/20220706_021112_75cf4196_w1920.webp" alt="Osaka">
          <div class="region-overlay">
            <span class="region-name">大阪</span>
            <span class="region-count">215 件委託</span>
          </div>
        </div>
        <div class="region-card" @click="filterRegion('kyoto')">
          <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800" alt="Kyoto">
          <div class="region-overlay">
            <span class="region-name">京都</span>
            <span class="region-count">189 件委託</span>
          </div>
        </div>
        <div class="region-card" @click="filterRegion('hokkaido')">
          <img src="https://www.niusnews.com/upload/posts/posts_image3_76059_1554973221.jpg" alt="Hokkaido">
          <div class="region-overlay">
            <span class="region-name">北海道</span>
            <span class="region-count">105 件委託</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container">
      <h2 class="section-title center-text">簡單四步驟</h2>

      <div class="steps-wrapper">
        <div class="step-item">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h3>發布委託</h3>
          <p>填寫商品詳情與願付價格</p>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3>達人接單</h3>
          <p>旅日小幫手確認並接取任務</p>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <h3>採購寄回</h3>
          <p>小幫手購買後帶回或寄送</p>
        </div>
        <div class="step-line"></div>
        <div class="step-item">
          <div class="step-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
            <span class="currency-symbol">$</span>
          </div>
          <h3>確認撥款</h3>
          <p>收到商品無誤,系統撥款</p>
        </div>
      </div>
    </section>

    <section class="section-container bg-light">
      <div class="section-header">
        <h2 class="section-title">精選現貨</h2>
        <button class="view-more-btn secondary" @click="router.push('/products')">逛逛賣場</button>
      </div>

      <div class="product-grid">
        <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="product-card"
            @click="router.push(`/product/${product.id}`)"
        >
          <div class="card-image-box">
            <img :src="getImageUrl(product.image)" :alt="product.name" class="product-img-full">
            <div class="status-tag">現貨</div>
          </div>

          <div class="product-card-body">
            <h3 class="product-item-name">{{ product.name }}</h3>

            <div class="product-price-row">
              <span class="currency">NT$</span>
              <span class="amount">{{ formatNumber(product.price) }}</span>
            </div>

            <div class="tags-row">
              <span class="mini-tag">
                <i class="icon">📍</i> {{ product.location || '日本' }}
              </span>
              <span class="mini-tag secondary">
                 {{ product.category || '精選' }}
              </span>
            </div>

            <button class="view-detail-btn">
              查看詳情
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/product';
import { useCommissionStore } from "@/stores/commission";

const router = useRouter();
const commissionStore = useCommissionStore();
const productStore = useProductStore();

// 用來存放精選商品的變數
const featuredProducts = ref([]);

// 組件載入時抓取資料
onMounted(async () => {
  commissionStore.fetchHotCommissions();
  featuredProducts.value = await productStore.fetchFeaturedProducts();
});

// 工具函式
const formatFeeRate = (feeRate: number) => Math.round(feeRate);
const formatNumber = (num: number) => num.toLocaleString();
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-TW');

const getImageUrl = (path: string | null) => {
  if (!path) return 'https://i.imgur.com/6VBx3io.png';
  if (path.startsWith('http')) return path;
  return `http://localhost:5275${path}`;
};

const filterRegion = (region: string) => {
  router.push({ path: '/commissions', query: { location: region } });
};
</script>

<style scoped>
:root {
  --primary-pink: #fb7299;
  --secondary-blue: #00aeec;
  --text-dark: #222;
  --text-gray: #666;
  --bg-light: #f4f5f7;
}

.home-page {
  background-color: #fff;
  min-height: 100vh;
}

/* ================= Hero Section ================= */
.hero-section {
  position: relative;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(34, 34, 34, 0.6) 0%, rgba(251, 114, 153, 0.3) 100%);
  backdrop-filter: blur(2px);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
  margin-bottom: 40px;
}

.main-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
  letter-spacing: 2px;
}

.sub-title {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.95;
  text-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.hero-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.action-btn {
  padding: 16px 40px;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  border: none;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.action-btn.primary {
  background: #fb7299;
  color: white;
  box-shadow: 0 4px 15px rgba(251, 114, 153, 0.4);
}

.action-btn.secondary {
  background: white;
  color: #fb7299;
}

.btn-text {
  font-size: 18px;
  font-weight: bold;
}

.btn-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

/* ================= Stats Bar ================= */
.stats-bar {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px 60px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 40px;
  z-index: 3;
  width: 80%;
  max-width: 900px;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #fb7299;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #9499a1;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #eee;
}

/* ================= General Layout ================= */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-container.bg-light {
  background-color: #f9f9f9;
  max-width: 100%;
}

/* 讓內層內容回到中間 */
.section-container.bg-light .section-header,
.section-container.bg-light .region-grid,
.section-container.bg-light .product-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.section-header.center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: #222;
  margin-bottom: 8px;
}

.center-text {
  text-align: center;
}

.section-desc {
  color: #666;
  font-size: 16px;
}

.view-more-btn {
  padding: 10px 24px;
  border: 1px solid #fb7299;
  color: #fb7299;
  background: white;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}

.view-more-btn:hover {
  background: #fb7299;
  color: white;
}

.view-more-btn.secondary {
  border-color: #00aeec;
  color: #00aeec;
}

.view-more-btn.secondary:hover {
  background: #00aeec;
  color: white;
}

/* ================= (舊) 委託卡片樣式 ================= */
.commissions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.simple-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.simple-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
  border-color: #fb7299;
}

.card-img-box {
  position: relative;
  height: 180px;
  background: #f8f8f8;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.simple-card:hover .product-img {
  transform: scale(1.05);
}

.img-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.fee-rate-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fb7299;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.card-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  color: #222;
  margin-bottom: 16px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  align-items: center;
}

.label {
  color: #9499a1;
}

.value.price {
  color: #222;
  font-weight: 600;
}

.value.date {
  color: #666;
}

.value.reward {
  color: #fb7299;
  font-weight: 800;
  font-size: 15px;
}

.card-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed #eee;
}

.accept-action-btn {
  width: 100%;
  padding: 10px;
  background: #fb7299;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.accept-action-btn:hover {
  background: #e85a85;
}

/* ================= ✨ (新) 精選商品卡片樣式 ================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  border-color: #fb7299;
  box-shadow: 0 12px 25px rgba(251, 114, 153, 0.15);
}

.card-image-box {
  height: 200px; /* 加高一點點 */
  position: relative;
  background-color: #f8f8f8;
  overflow: hidden;
}

.product-img-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-img-full {
  transform: scale(1.08);
}

.status-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #fb7299;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.product-card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-item-name {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
  height: 44px; /* 限制兩行高度 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: bold;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
  color: #fb7299;
}

.product-price-row .currency {
  font-size: 14px;
  margin-right: 4px;
  font-weight: bold;
}

.product-price-row .amount {
  font-size: 22px;
  font-weight: 800;
}

.tags-row {
  display: flex;
  flex-direction: column; /* 關鍵：讓它們變兩行 */
  align-items: flex-start; /* 靠左對齊，不要拉伸到滿版 */
  gap: 8px;
  margin-bottom: 15px;
}

.mini-tag {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.mini-tag.secondary {
  background: #eef7ff;
  color: #00aeec;
}

.view-detail-btn {
  margin-top: auto;
  width: 100%;
  padding: 8px;
  background: transparent;
  color: #fb7299;
  border: 1px solid #fb7299;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.view-detail-btn:hover {
  background: #fb7299;
  color: white;
}


/* ================= Region Grid ================= */
.region-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.region-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 240px;
  cursor: pointer;
}

.region-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.region-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  display: flex;
  flex-direction: column;
}

.region-card:hover img {
  transform: scale(1.1);
}

.region-name {
  font-size: 24px;
  font-weight: bold;
}

.region-count {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
  color: #fb7299;
}

/* ================= Steps ================= */
.steps-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 40px;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 10px;
}

.step-icon {
  width: 80px;
  height: 80px;
  background: #fff0f3;
  color: #fb7299;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  transition: 0.3s;
  position: relative;
}

.currency-symbol {
  position: absolute;
  font-size: 32px;
  font-weight: bold;
}

.step-item:hover .step-icon {
  background: #fb7299;
  color: white;
  transform: rotateY(180deg);
}

.step-line {
  flex: 0 0 100px;
  height: 2px;
  background: #eee;
  margin-top: 40px;
}

.step-item h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.step-item p {
  color: #888;
  font-size: 14px;
  line-height: 1.6;
}

/* ================= RWD ================= */
@media (max-width: 1024px) {
  .commissions-grid, .region-grid, .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: auto;
    padding: 100px 0 80px;
  }
  .stats-bar {
    position: relative;
    bottom: 0;
    flex-direction: column;
    width: 90%;
    gap: 20px;
    margin-top: 40px;
  }
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  .steps-wrapper {
    flex-direction: column;
    gap: 30px;
  }
  .step-line {
    display: none;
  }
  .commissions-grid, .region-grid, .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>