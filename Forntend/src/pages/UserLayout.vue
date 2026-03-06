<template>
  <div class="admin-wrapper">
    <div class="user-layout-container">

      <aside class="sidebar">
        <div class="user-summary">
          <img :src="getImageUrl(currentUserAvatar)" alt="avatar" class="avatar">
          <div class="user-info">
            <span class="username">{{currentUserName}}</span>
            <span class="user-role-tag">一般會員</span>
          </div>
        </div>

        <nav class="menu-list">
          <router-link to="/user/profile" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">個人資料</span>
          </router-link>

<!--          <router-link to="/user/orders" class="menu-item">-->
<!--            <i class="icon-dot"></i>-->
<!--            <span class="menu-text">訂單管理</span>-->
<!--          </router-link>-->

          <router-link to="/user/commissions" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">委託管理</span>
          </router-link>
          <router-link to="/user/buyer-order" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">賣場買的東西</span>
          </router-link>
          <router-link to="/user/history" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">歷史紀錄</span>
          </router-link>

          <router-link to="/user/center-view" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">戰情室</span>
          </router-link>

          <router-link to="/user/shops" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">賣場管理</span>
          </router-link>
          <router-link to="/user/messageBox" class="menu-item">
            <i class="icon-dot"></i>
            <span class="menu-text">訊息中心</span>
          </router-link>
          <div class="menu-group">
            <div class="menu-item" @click="toggleReview">
              <i class="icon-dot"></i>
              <span class="menu-text">審核中心</span>
              <i class="arrow-icon" :class="{ expanded: isReviewOpen }">▼</i>
            </div>

            <div v-show="isReviewOpen" class="sub-menu">
              <router-link to="/user/review" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">委託審核</span>
              </router-link>
              <router-link to="/user/product-review" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">商品審核</span>
              </router-link>
              <router-link to="/user/store-review" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">賣場審核</span>
              </router-link>
            </div>

          </div>

          <div class="menu-group">
            <div class="menu-item" @click="toggleOrder">
              <i class="icon-dot"></i>
              <span class="menu-text">訂單總覽</span>
              <i class="arrow-icon" :class="{ expanded: isOrderOpen }">▼</i>
            </div>

            <div v-show="isOrderOpen" class="sub-menu">
              <router-link to="/user/orders" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">委託訂單</span>
              </router-link>
              <router-link to="/user/store-order" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">賣場訂單</span>
              </router-link>
            </div>
          </div>

          <div class="menu-group">
            <div class="menu-item" @click="toggleWallet">
              <i class="icon-dot"></i>
              <span class="menu-text">錢包總覽</span>
              <i class="arrow-icon" :class="{ expanded: isWalletOpen }">▼</i>
            </div>

            <div v-show="isWalletOpen" class="sub-menu">
              <router-link to="/user/balance" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">錢包管理</span>
              </router-link>
              <router-link to="/user/walletLogs" class="menu-item sub-menu-item">
                <i class="icon-dot"></i>
                <span class="menu-text">錢包紀錄</span>
              </router-link>
            </div>
          </div>
        </nav>

        <div class="logout-section">
          <button class="logout-btn" @click="handleLogout">
            登出帳號
          </button>
        </div>
      </aside>

      <main class="content-area">
        <router-view />
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {onMounted} from "vue";
import {ref} from "vue";
const router = useRouter();
const currentUserName = ref(localStorage.getItem('userName'));
// const currentUserName = ref(localStorage.getItem('userName') || '訪客');
const currentUserAvatar = ref(localStorage.getItem('userAvatar') || '');
const isWalletOpen = ref(false);
const isOrderOpen = ref(false);

//
const isReviewOpen = ref(false);


const toggleWallet = () => {
  isWalletOpen.value = !isWalletOpen.value;
}
const toggleOrder = ()=>{
  isOrderOpen.value = !isOrderOpen.value;
}
// 切換展開樣式
const toggleReview = ()=>{
  isReviewOpen.value = !isReviewOpen.value;
}
const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    router.push('/products');
  }
};
onMounted(() => {
  window.addEventListener('user-data-updated', () => {
    currentUserName.value = localStorage.getItem('userName') || '訪客';
    currentUserAvatar.value = localStorage.getItem('userAvatar') || '';
  });
});
const getImageUrl = (path: string) => {
  if (!path) return 'https://i.imgur.com/6VBx3io.png';
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `http://localhost:5275${path}`;
};
</script>

<style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #f4f5f7;
}
</style>

<style scoped>
:root {
  --bili-pink: #fb7299;
}

/* --- 1. 背景包裝：控制離 Navbar 距離與內容置中 --- */
.admin-wrapper {
  background-color: #f4f5f7;
  min-height: 100vh;
  /* ✨ 頂部留 80px 避開 Navbar，底部留 20px */
  padding: 100px 0 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
}

/* --- 2. 大卡片容器：寬度最大化修改 --- */
.user-layout-container {
  display: flex;
  /* ✨ 修改這裡：98% 寬度讓左右留白縮到最小 */
  width: 98%;
  /* ✨ 移除或設為極大值，讓它隨螢幕寬度伸展 */
  max-width: 2560px;

  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 120px); /* 動態計算高度 */
}

/* --- 3. 側邊欄：寬度固定，內容不隨捲動消失 --- */
.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #f1f1f1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.user-summary {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f8f8f8;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 1px solid #eee;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  line-height: 1.2;
}
.user-role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background-color: #fb7299; /* B站粉色 */
  color: white;

  font-size: 14px;        /* 小尺寸字體 */
  font-weight: bold;
  padding: 1px 8px;       /* 膠囊內距 */
  border-radius: 10px;    /* 圓角造型 */

  width: fit-content;     /* 寬度隨文字長度變化 */
  margin-top: 5px;        /* 與名字保持間距 */

  /* 增加一點點立體感 */
  box-shadow: 0 1px 4px rgba(251, 114, 153, 0.2);
}


.menu-list {
  padding: 20px 10px 0 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  margin-bottom: 5px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  border-radius: 8px;
  transition: 0.2s;
}

.icon-dot {
  width: 6px;
  height: 6px;
  background-color: transparent;
  border-radius: 50%;
  margin-right: 12px;
}

.menu-item:hover {
  background-color: #fff0f3;
  color: #fb7299;
}

.router-link-active {
  background-color: #fb7299 !important;
  color: #ffffff !important;
  font-weight: bold;
}

.router-link-active .icon-dot {
  background-color: #ffffff;
}

/* --- 4. 登出區塊 --- */
.logout-section {
  padding: 10px 28px;
  margin-top: 10px;
}

.logout-btn {
  width: 100%;
  padding: 9px;
  border: 1px solid #e7e7e7;
  background: transparent;
  color: #99a2aa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.3s;
}

.logout-btn:hover {
  border-color: #fb7299;
  color: #fb7299;
  background-color: #fff0f3;
}

/* --- 5. 右側內容區域 --- */
.content-area {
  flex: 1;
  /* ✨ 增加內距，確保在大螢幕上內容不會太擠 */
  padding: 40px;
  background-color: #ffffff;
  overflow-y: auto;
}

/* 確保內部元件貼齊頂部 */
.content-area > * {
  margin: 0 !important;
}
.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* 錢包選單群組 */
.menu-group {
  margin-bottom: 5px;
}

/* 箭頭圖示 */
.arrow-icon {
  margin-left: auto;
  font-size: 10px;
  color: #999;
  transition: transform 0.3s ease;
}

.arrow-icon.expanded {
  transform: rotate(-180deg);
}

/* 子選單容器 */
.sub-menu {
  overflow: hidden;
}

/* 子選單項目 */
.sub-menu-item {
  padding-left: 38px !important;
  font-size: 13px;
  color: #888;
}

.sub-menu-item .icon-dot {
  width: 4px;
  height: 4px;
}

.sub-menu-item:hover {
  background-color: #fff0f3;
  color: #fb7299;
}

.sub-menu-item.router-link-active {
  background-color: #ffebf0 !important;
  color: #fb7299 !important;
  font-weight: 600;
}

.sub-menu-item.router-link-active .icon-dot {
  background-color: #fb7299;
}

</style>