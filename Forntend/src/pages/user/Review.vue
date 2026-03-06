<template>
  <div class="commissions-page">
    <div class="page-header">
      <h2>委託審核中心 (๑•̀ㅂ•́)و✧</h2>
      <p>-----------</p>
    </div>

    <div class="commissions-grid">
      <div
          v-for="item in pendingCommissions"
          :key="item.serviceCode"
          class="simple-card"
      >
        <div class="card-img-box">
          <img
              :src="item.imageUrl ? ('http://127.0.0.1:5275' + item.imageUrl) : 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg'"
              class="product-img"
          >
          <span class="img-tag status-pending">審核中</span>
        </div>

        <div class="card-info">
          <h3 class="product-name">{{ item.title }}</h3>

          <div class="detail-row">
            <span class="label">價格：</span>
            <span class="value price">{{item.currency}}$ {{ item.price }}</span>
          </div>

          <div class="detail-row">
            <span class="label">購買地點：</span>
            <span class="value">{{ item.location }}</span>
          </div>
          <div class="detail-row">
            <span class="label">截止時間：</span>
            <span class="value">{{ formatDate(item.endAt) }}</span>
          </div>

          <div class="card-actions">
            <button class="approve-action-btn" @click.stop="handleApprove(item.serviceCode)">
              審核通過
            </button>
            <button class="reject-action-btn" @click.stop="handleReject(item.serviceCode)">
              退回
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pendingCommissions.length === 0" class="empty-box">
      目前沒有需要審核的委託，辛苦囉！ (｡･ω･｡)
    </div>
    <div v-if="showRejectModal" class="modal-overlay">
      <div class="modal-content">
        <h3>審核退回原因 (´•ω•̥`)</h3>

        <div class="input-group">
          <label>退回原因 *</label>
          <textarea
              v-model="rejectReason"
              placeholder="請詳細說明退回原因，方便使用者修改喔！例如：圖片太模糊、價格不合理等..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showRejectModal = false">取消</button>
          <button class="confirm-btn" @click="submitReject">確認退回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name = 'Review'>
import { computed, onMounted } from 'vue';
import { useCommissionStore } from '@/stores/commission';
import {ref} from "vue";
import Swal from 'sweetalert2';

// 1. 初始化 Store
const store = useCommissionStore();

// 2. 頁面掛載時，抓取所有委託資料
onMounted(() => {
  store.fetchUserManageCommissions();
});

// 3. 核心過濾邏輯：只把「審核中」的委託抓出來顯示
const pendingCommissions = computed(() => {
  return store.commissions.filter(item => item.status === '審核中');
});
console.log(pendingCommissions);


// 4. 實作「審核通過」
const handleApprove = async (serviceCode: string) => {
  const result = await Swal.fire({
    title: '確定要通過這筆委託嗎？',
    text: '',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#fb7299',
    cancelButtonColor: '#9499a0',
    confirmButtonText: '確定通過 ',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      const apiResult = await store.reviewCommission(serviceCode, true, '通過');

      if (apiResult?.success) {
        Swal.fire({
          icon: 'success',
          title: '審核通過成功！',
          text: '(๑˃ᴗ˂)ﻭ',
          confirmButtonColor: '#fb7299',
          timer: 2000
        });

        await store.fetchUserManageCommissions();
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || '操作失敗，請稍後再試';

      Swal.fire({
        icon: 'error',
        title: '哎呀出錯了 (´•ω•̥`)',
        text: errorMessage,
        confirmButtonColor: '#fb7299'
      });
    }
  }
};


// 5. 實作「審核失敗」
// 1. ✨ 當管理員按下「審核失敗」按鈕時
const handleReject = (serviceCode: string) => {
  currentTargetCode.value = serviceCode; // 記住這筆委託的身分
  rejectReason.value = '';               // 清空上次填寫的內容，這很重要喔！
  showRejectModal.value = true;          // 華麗地打開彈窗 (｡◕∀◕｡)
};

// 2. ✨ 當管理員在彈窗按下「確認退回」時
// 5. 確認退回
const submitReject = async () => {
  if (!rejectReason.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: '請填寫退回原因唷！',
      text: '(´・ω・`)',
      confirmButtonColor: '#fb7299'
    });
    return;
  }

  try {
    const result = await store.reviewCommission(currentTargetCode.value, false, rejectReason.value);

    if (result?.success) {
      showRejectModal.value = false;

      Swal.fire({
        icon: 'success',
        title: '已成功退回委託！',
        confirmButtonColor: '#fb7299',
        timer: 2000
      });

      await store.fetchUserManageCommissions();
    }
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || '連線好像有點問題，請稍後再試';

    Swal.fire({
      icon: 'error',
      title: '操作失敗 (´•ω•̥`)',
      text: errorMessage,
      confirmButtonColor: '#fb7299'
    });
  }
};

// --- 審核退回彈窗相關 ---
const showRejectModal = ref(false); // 控制彈窗顯示/隱藏
const currentTargetCode = ref('');  // 紀錄目前正在審核哪一筆
const rejectReason = ref('');       // 存放管理員輸入的失敗原因

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '無日期';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-'); // 把 / 換成 -
};
</script>

<style scoped>
/* 延用原本的頁面內距 */
.commissions-page {
  padding: 20px;
}

/* 標題區域樣式 */
.page-header {
  margin-bottom: 30px;
  border-left: 5px solid #fb7299;
  padding-left: 15px;
}
.page-header h2 {
  font-size: 24px;
  color: #222;
  margin-bottom: 5px;
}
.page-header p {
  color: #9499a0;
  font-size: 14px;
}

/* 延用原本的網格佈局 */
.commissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 卡片與圖片框 (參照原樣式) */
.simple-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s;
}
.simple-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
.card-img-box {
  height: 180px;
  position: relative;
}
.product-img {
  width: 100%; height: 100%; object-fit: cover;
}

/* 狀態標籤 (使用原本的黃色) */
.img-tag {
  position: absolute; top: 10px; right: 10px;
  padding: 4px 12px; border-radius: 20px;
  color: white; font-size: 12px; font-weight: bold;
}
.status-pending { background-color: #ffb11b; }

/* 資訊內容區 */
.card-info { padding: 15px; }
.product-name { font-size: 16px; margin-bottom: 10px; font-weight: bold; }
.detail-row { font-size: 13px; margin-bottom: 5px; color: #666; }
.price { color: #fb7299; font-weight: bold; }

/* ✨ 關鍵：審核按鈕樣式 */
.card-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.approve-action-btn {
  flex: 2; /* 讓通過按鈕寬一點，引導點擊 */
  background-color: #fb7299;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.approve-action-btn:hover { background-color: #ff85ad; }

.reject-action-btn {
  flex: 1;
  background-color: white;
  color: #9499a0;
  border: 1px solid #ccd0d7;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.reject-action-btn:hover {
  background-color: #f4f5f7;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.empty-box {
  text-align: center; padding: 100px; color: #bbb;
}
/* --- 彈窗背景遮罩：讓後方背景變暗，集中注意力 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* --- 彈窗主體：跟出貨彈窗一樣的白色方塊 --- */
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #222;
  text-align: center;
  font-size: 18px;
}

/* --- 輸入框群組：讓 Label 與 Textarea 垂直排列 --- */
.input-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.input-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  height: 100px;
  resize: none; /* 禁止使用者自己拉動大小，維持美觀 */
}

.input-group textarea:focus {
  outline: none;
  border-color: #fb7299; /* 聚焦時變粉紅色 */
}

/* --- 彈窗按鈕區：取消與確認並排 --- */
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
}

.confirm-btn {
  flex: 1;
  padding: 10px;
  background: #fb7299; /* 妳最愛的粉紅色 */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.confirm-btn:hover {
  background-color: #ff85ad;
}
</style>