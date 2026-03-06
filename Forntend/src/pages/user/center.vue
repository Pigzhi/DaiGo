<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-left">
        <h1>營運數據儀表板</h1>
        <span class="subtitle">PowerBI 數據整合中心</span>
      </div>
      <span class="date">資料更新時間：2026/02/04</span>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">會員總數</div>
        <div class="stat-value">787</div>
        <div class="stat-change up">↑ 12%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">本月營收</div>
        <div class="stat-value">NT$ 1,310</div>
        <div class="stat-change up">↑ 5%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">進行中委託</div>
        <div class="stat-value">42</div>
        <div class="stat-info">分佈於 3 個縣市</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">已完成案件</div>
        <div class="stat-value">156</div>
        <div class="stat-change">本月 +12</div>
      </div>
    </div>

    <h2 class="section-title">趨勢與營收分析</h2>
    <div class="charts-row">
      <div class="dashboard-card">
        <h3 class="card-title">會員總數及每月會員數成長趨勢</h3>
        <div class="image-container">
          <img src="/public/member_growth.png" alt="會員成長趨勢圖" class="chart-img">
        </div>
      </div>

      <div class="dashboard-card">
        <h3 class="card-title">當月營收及當月撥款</h3>
        <div class="image-container">
          <img src="/public/revenue_pie.png" alt="營收圓餅圖" class="chart-img">
        </div>
      </div>
    </div>

    <h2 class="section-title">地區分佈分析</h2>

    <div class="map-section-row">

      <div class="dashboard-card">
        <h3 class="card-title">接取委託熱點地圖</h3>
        <div class="image-container map-container">
          <img src="/all_commissions.jpg" alt="接委託地圖" class="chart-img">
        </div>
      </div>

      <div class="dashboard-card">
        <h3 class="card-title">全部委託（包含已完成）</h3>
        <div class="image-container map-container">
          <img src="/other.jpg" alt="已完成地圖" class="chart-img">
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
// 這裡是靜態圖片展示，所以不需要複雜的 JS 邏輯喔！
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f4f7fa;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.dashboard-header h1 {
  font-size: 26px;
  color: #2c3e50;
  font-weight: 800;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.date {
  color: #888;
  font-size: 14px;
  font-weight: 500;
}

/* 標題樣式 */
.section-title {
  font-size: 18px;
  color: #444;
  margin: 30px 0 15px;
  padding-left: 10px;
  border-left: 5px solid #fb7299;
}

/* 數據卡樣式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 10px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-title {
  color: #888;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.2;
}

.stat-change {
  font-size: 13px;
  margin-top: 8px;
  font-weight: 600;
}
.stat-change.up { color: #10b981; }

.stat-info {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

/* 圖片區塊佈局 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 兩欄 */
  gap: 25px;
  margin-bottom: 10px;
}

.dashboard-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 700;
  text-align: center;
}

/* 圖片容器 */
.image-container {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 這裡可以設定一個最小高度，避免圖片還沒載入時扁掉 */
  min-height: 300px;
}

.chart-img {
  width: 100%;
  height: auto;
  max-height: 400px; /* 限制最大高度，避免圖片太長 */
  object-fit: contain; /* 保持圖片比例，不要變形 */
  border-radius: 4px;
}

/* 響應式設計：手機版變單欄 */
@media (max-width: 900px) {
  .stats-grid, .charts-row {
    grid-template-columns: 1fr;
  }
}
/* 新增的地圖區塊佈局：單欄垂直排列 */
.map-section-row {
  display: grid;
  grid-template-columns: 1fr; /* 1fr 代表佔滿 100% 寬度 */
  gap: 30px; /* 卡片之間的距離 */
  margin-bottom: 40px;
}

/* 讓地圖容器可以更高一點，視覺比較大器 */
.map-container {
  min-height: 500px; /* 原本是 300px，地圖我們給高一點 */
}

/* 確保地圖圖片也能跟著長高 */
.map-container .chart-img {
  max-height: 600px; /* 放寬最大高度限制 */
  width: 100%;
  object-fit: contain; /* 或是 cover，看你想要完整顯示還是填滿 */
}
</style>