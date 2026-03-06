<template>
  <div v-if="showToast" class="toast-notification">
    <div class="toast-content">
      <span class="toast-icon">🔔</span>
      {{ toastMessage }}
    </div>
  </div>

  <nav class="bili-nav">
    <div class="nav-left-group">
      <div class="logo-wrapper" @click="router.push('/homepage')">
        <img src="@/assets/everett.png" alt="logo" class="logo-img">
        <span class="logo-text">demo</span>
      </div>

      <div class="nav-links">
        <span class="nav-link-item" @click="goToProducts">買東西</span>
        <span class="nav-link-item" @click="goToCommissions">接委託</span>
      </div>
    </div>

    <div class="nav-center">
      <div class="search-bar">
        <div class="search-dropdown"
             @mouseenter="isOpen = true"
             @mouseleave="isOpen = false"
        >
        </div>
        <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索感興趣的委託"
            @keyup.enter="handleSearch"
        />
        <button class="search-btn" type="button" @click="handleSearch">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="nav-right">
      <template v-if="isLoggedIn">
        <div class="action-group">
          <button class="action-btn-outline" @click="navigateTo('/user/shops')">
            <span class="btn-icon">+</span> 新增商品
          </button>
          <button class="action-btn-outline" @click="goToCreateCommission">
            <span class="btn-icon">+</span> 新增委託
          </button>
        </div>

        <div class="notification-container">
          <button class="notification-btn" @click="handleNotificationClick">
            <Bell :size="22" />
            <span v-if="hasUnread" class="red-dot"></span>
          </button>

          <div v-if="isNotificationOpen" class="notification-dropdown">
            <div class="notification-header">
              <span>通知中心</span>
            </div>

            <ul class="notification-list">
              <li v-if="notifications.length === 0" class="empty-msg">
                (｡•́︿•̀｡) 目前沒有新通知
              </li>

              <li v-else v-for="(item, index) in notifications" :key="index" class="notification-item">
                <div class="notif-icon-box">
                  <span class="dot-icon"></span>
                </div>
                <div class="notif-content">
                  <div class="notif-top">
                    <span class="notif-title">{{ item.title }}</span>
                    <span class="notif-time">{{ item.time }}</span>
                  </div>
                  <p class="notif-text">{{ item.content }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="user-profile-wrapper">
          <div class="avatar-box">
            <img :src="getImageUrl(currentUserAvatar)" alt="User Avatar" class="avatar-img">
          </div>

          <div class="profile-card">
            <div class="card-header">
              <p class="user-name">{{ currentUserName }}</p>
              <div class="user-badges"><span class="badge-vip">小幫手賣家</span></div>
            </div>
            <ul class="card-menu">
              <li @click="navigateTo('/user/profile')"><span>會員中心</span> <i class="arrow">〉</i></li>
              <li @click="navigateTo('/user/balance')"><span>我的錢包</span> <i class="arrow">〉</i></li>
              <li @click="navigateTo('/user/orders')"><span>訂單管理</span> <i class="arrow">〉</i></li>
              <li @click="navigateTo('/user/commissions')"><span>委託管理</span> <i class="arrow">〉</i></li>
              <li @click="navigateTo('/user/shops')"><span>賣場管理</span> <i class="arrow">〉</i></li>
              <li @click="navigateTo('/user/messageBox')"><span>訊息中心</span> <i class="arrow">〉</i></li>
            </ul>
            <div class="card-footer">
              <div class="logout-item" @click="handleLogout">登出帳號</div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="auth-section">
        <button class="login-btn" @click="navigateTo('/login')">登入</button>
        <button class="register-btn" @click="navigateTo('/register')">註冊</button>
      </div>
    </div>
  </nav>

  <main class="main-content">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useCommissionStore } from "@/stores/commission";
import { Bell } from "lucide-vue-next";
import { useNotificationStore } from "@/stores/notify"; // 確保路徑是對的

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const commissionStore = useCommissionStore();
const notificationStore = useNotificationStore();

// --- 狀態變數 ---
const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentUserName = computed(() => authStore.userName || '訪客');
const currentUserAvatar = ref(localStorage.getItem('userAvatar') || '');
const isOpen = ref(false);
const searchKeyword = ref('');
const isNotificationOpen = ref(false); // 通知選單開關

// --- Store 連結 ---
// 橫幅狀態
const showToast = computed(() => notificationStore.showToast);
const toastMessage = computed(() => notificationStore.toastMessage);
// 通知列表 (從 Store 拿，所以是唯讀的 Computed)
const notifications = computed(() => notificationStore.notifications);
// 紅點狀態
const hasUnread = computed(() => notificationStore.hasUnread);


// --- ✨ 3. 修正後的點擊邏輯 ---
const handleNotificationClick = () => {
  // 切換選單開關
  isNotificationOpen.value = !isNotificationOpen.value;

  // 如果現在是「打開」的狀態，就叫 Store 把紅點消掉
  if (isNotificationOpen.value) {
    notificationStore.markAsRead();
  }
};

// 監聽路由變化時更新頭像
watch(() => route.path, () => {
  currentUserAvatar.value = localStorage.getItem('userAvatar') || '';
});

// --- 導航功能 ---
const goToProducts = () => router.push('/products');
const goToCreateCommission = () => router.push('/create-commission');
const goToCommissions = () => router.push('/commissions');
const navigateTo = (path: string) => { router.push(path); };

// 搜尋
const handleSearch = () => {
  router.push({ path: '/commissions', query: { keyword: searchKeyword.value } });
  commissionStore.fetchCommissions({ keyword: searchKeyword.value });
};

// 登出
const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    authStore.logout();
    router.push('/login');
  }
};

const getImageUrl = (path: string) => {
  if (!path) return 'https://i.imgur.com/6VBx3io.png';
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `http://localhost:5275${path}`;
};

// --- 初始化與 SignalR ---
onMounted(() => {
  // 1. 抓取歷史通知
  notificationStore.fetchNotifications();

  // 2. 監聽頭像更新
  window.addEventListener('user-data-updated', () => {
    currentUserAvatar.value = localStorage.getItem('userAvatar') || '';
  });

  // 3. SignalR 連線
  const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5275/notificationHub')
      .withAutomaticReconnect()
      .build();

  connection.on('ReceiveNotification', (message) => {
    console.log('收到新通知囉！(≧∇≦)', message);

    // ✨ 修正重點：不要直接修改 notifications (因為它是 computed)
    // 而是呼叫 Store 的 action 來處理資料和紅點
    notificationStore.addNotification(message);
  });

  connection.start()
      .then(() => console.log('SignalR 連線成功！'))
      .catch(err => console.error('SignalR 連線失敗', err));
});
</script>

<style scoped>
/* --- 原本的導覽列樣式 (保持不變) --- */
.bili-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40px; height: 100px;
  background-color: rgba(255, 255, 255, 0.95);
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  backdrop-filter: blur(20px); box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  border-bottom: 1px solid #f1f2f3;
}
.nav-left-group { display: flex; align-items: center; gap: 30px; }
.logo-wrapper { display: flex; align-items: center; cursor: pointer; }
.logo-img { width: 50px; height: 50px; border-radius: 6px; margin-right: 8px; }
.logo-text { font-size: 30px; font-weight: 900; color: #fb7299; letter-spacing: -0.5px; }
.nav-links { display: flex; gap: 20px; }
.nav-link-item { font-size: 20px; color: #18191c; cursor: pointer; position: relative; transition: color 0.3s; }
.nav-link-item:hover { color: #fb7299; }
.nav-link-item::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background-color: #fb7299; transition: width 0.3s; }
.nav-link-item:hover::after { width: 100%; }

.nav-center { flex: 1; max-width: 600px; margin: 0 20px; }
.search-bar { display: flex; align-items: center; background-color: #f1f2f3; border-radius: 8px; padding: 0 8px 0 16px; height: 50px; border: 1px solid transparent; transition: 0.3s; }
.search-bar:focus-within { background-color: white; border-color: #fb7299; }
.search-bar input { flex: 1; background: transparent; border: none; outline: none; font-size: 16px; }
.search-btn { background: transparent; border: none; color: #61666d; cursor: pointer; padding: 4px; }
.search-btn:hover { color: #fb7299; }

.nav-right { display: flex; align-items: center; gap: 20px; }
.action-group { display: flex; gap: 10px; }
.action-btn-outline { background: white; color: #61666d; border: 1px solid #ccd0d7; padding: 10px 20px; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
.action-btn-outline:hover { color: #fb7299; border-color: #fb7299; background-color: #fff0f3; }
.btn-icon { font-size: 16px; font-weight: 400; color: #fb7299; }

.auth-section { display: flex; gap: 12px; }
.login-btn { background: #f1f2f3; color: #18191c; border: none; padding: 8px 22px; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
.login-btn:hover { background: #e3e5e7; transform: translateY(-1px); }
.register-btn { background: #fb7299; color: white; border: none; padding: 8px 22px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.register-btn:hover { background: #ff85a2; transform: translateY(-2px) scale(1.02); box-shadow: 0 4px 15px rgba(251, 114, 153, 0.4); }

.user-profile-wrapper { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
.avatar-box { display: flex; align-items: center; z-index: 102; cursor: pointer; }
.avatar-img { width: 70px; height: 70px; border-radius: 50%; border: 1px solid #e3e5e7; background-color: white; transition: all 0.4s; }
.user-profile-wrapper:hover .avatar-img { transform: scale(1.2) translateY(5px); border-color: #fb7299; }

.profile-card {
  pointer-events: none; opacity: 0; visibility: hidden; transform: translateY(20px); transition: all 0.5s;
  position: absolute; top: 100%; right: -10px; width: 240px; background: white; border-radius: 12px;
  padding: 20px; margin-top: 15px; border: 1px solid #f1f2f3; box-shadow: 0 10px 40px rgba(0,0,0,0.1); z-index: 100;
}
.user-profile-wrapper:hover .profile-card { pointer-events: auto; opacity: 1; visibility: visible; transform: translateY(0); }
.profile-card::before { content: ""; position: absolute; top: -15px; left: calc(100% - 40px); width: 40px; height: 15px; background: transparent; }

.user-name { color: #fb7299; font-size: 17px; font-weight: bold; margin-bottom: 4px; }
.badge-vip { background: #fff0f3; color: #fb7299; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
.card-menu { list-style: none; padding: 10px 0; border-bottom: 1px solid #f1f2f3; }
.card-menu li { display: flex; justify-content: space-between; align-items: center; padding: 10px 8px; cursor: pointer; font-size: 16px; color: #61666d; border-radius: 6px; transition: 0.2s; }
.card-menu li:hover { background-color: #f6f7f8; color: #fb7299; }
.arrow { color: #c9ccd0; font-size: 9px; }
.logout-item { padding-top: 15px; color: #9499a0; font-size: 12px; text-align: center; cursor: pointer; transition: 0.2s; }
.logout-item:hover { color: #fb7299; }
.main-content { padding-top: 10px; }
* { margin: 0; padding: 0; box-sizing: border-box; }

/* --- ✨ 通知中心樣式優化 --- */

.notification-container {
  position: relative;
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.notification-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #61666d;
  padding: 10px; /* 加大一點點點擊範圍 */
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  position: relative; /* 為了紅點定位 */
}

.notification-btn:hover {
  color: #fb7299;
  background-color: #fff0f3; /* 淺粉色背景 */
}

/* 紅點點樣式 */
.red-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #ff4d4f;
  border-radius: 50%;
  border: 1px solid #fff;
  z-index: 10;
  box-shadow: 0 0 0 1px rgba(255, 77, 79, 0.2); /* 加一點光暈 */
}

/* 下拉選單本體 */
.notification-dropdown {
  position: absolute;
  top: 70px; /* 距離調整 */
  right: -20px; /* 稍微往右對齊，讓它不要超出畫面 */
  width: 320px; /* 稍微加寬 */
  background: white;
  border-radius: 12px; /* 統一圓角 */
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); /* 更柔和的陰影 */
  border: 1px solid #f0f0f0;
  z-index: 2000;
  overflow: hidden;
  animation: fadeIn 0.2s cubic-bezier(0.1, 0.7, 1.0, 0.1);
  transform-origin: top right;
}

/* 標題列 */
.notification-header {
  padding: 14px 16px;
  font-size: 15px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

/* 列表區域 */
.notification-list {
  list-style: none;
  max-height: 320px;
  overflow-y: auto; /* 保持捲動功能 */

  /* ✨ 隱藏捲軸的魔法代碼 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

/* Chrome, Safari, Opera 隱藏捲軸 */
.notification-list::-webkit-scrollbar {
  display: none;
}

/* 單個通知卡片 */
.notification-item {
  padding: 14px 16px;
  border-bottom: 1px solid #f7f8fa;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.notification-item:hover {
  background-color: #fff0f3; /* 懸浮時變粉紅 */
}

.notification-item:last-child {
  border-bottom: none;
}

/* 裝飾用的小圓點 icon */
.notif-icon-box {
  margin-top: 4px;
  flex-shrink: 0;
}
.dot-icon {
  display: block;
  width: 8px;
  height: 8px;
  background-color: #fb7299;
  border-radius: 50%;
}

.notif-content {
  flex: 1;
}

.notif-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notif-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.notif-time {
  font-size: 11px;
  color: #999;
}

.notif-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;

  /* 多行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-msg {
  padding: 40px 0;
  text-align: center;
  color: #bbb;
  font-size: 13px;
}

/* --- 橫幅通知 (Toast) --- */
.toast-notification {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 9999;
  background-color: rgba(0, 0, 0, 0.85); color: white; padding: 12px 24px;
  border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  animation: slideDown 0.4s ease;
  backdrop-filter: blur(4px);
}
.toast-content { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; }
@keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 30px; opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>