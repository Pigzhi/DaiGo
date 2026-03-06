<template>
  <div class="store-review-page">
    <div class="page-header">
      <h2>賣場審核中心 (๑•̀ㅂ•́)و✧</h2>
      <p>審核通過後賣場就可以開始營業囉~</p>
    </div>

    <div class="stores-grid">
      <div
          v-for="store in pendingStores"
          :key="store.storeId"
          class="simple-card"
      >
        <div class="card-img-box">
          <img
              :src="store.storeImage
                ? ('http://127.0.0.1:5275' + store.storeImage)
                : 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg'"
              class="store-img"
          >
          <span class="img-tag status-pending">審核中</span>
        </div>

        <div class="card-info">
          <h3 class="store-name">{{ store.storeName }}</h3>

          <div class="detail-row">
            <span class="label">賣場描述：</span>
          </div>
          <p class="store-desc" v-if="store.storeDescription">
            {{ truncateText(store.storeDescription, 60) }}
          </p>
          <p class="store-desc placeholder" v-else>
            這間店主很神祕,還沒寫介紹唷 (｡•́︿•̀｡)
          </p>

          <div class="detail-row">
            <span class="label">賣家 ID：</span>
            <span class="value">{{ store.sellerUid }}</span>
          </div>

          <div class="detail-row">
            <span class="label">送審時間：</span>
            <span class="value">{{ formatDate(store.submittedAt) }}</span>
          </div>

          <div class="card-actions">
            <button class="approve-action-btn" @click.stop="handleApprove(store.storeId)">
              審核通過
            </button>
            <button class="reject-action-btn" @click.stop="handleReject(store.storeId)">
              退回
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pendingStores.length === 0" class="empty-box">
      目前沒有需要審核的賣場，辛苦囉！ (｡･ω･｡)
    </div>

    <!-- 退回理由彈窗 -->
    <div v-if="showRejectModal" class="modal-overlay">
      <div class="modal-content">
        <h3>賣場審核退回 (´•ω•̥`)</h3>

        <div class="input-group">
          <label>退回原因 *</label>
          <textarea
              v-model="rejectReason"
              placeholder="請詳細說明退回原因，例如：賣場名稱不當、圖片不清晰、描述內容違規等..."
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

<script setup lang="ts" name="StoreReview">
import { onMounted, ref } from 'vue';
import { useStoreStore } from '@/stores/store';
import Swal from 'sweetalert2';

// 1. 初始化 Store
const storeStore = useStoreStore();

// 2. 狀態定義
const pendingStores = ref<any[]>([]);
const showRejectModal = ref(false);
const currentTargetStoreId = ref<number | null>(null);
const rejectReason = ref('');

// 3. 頁面掛載時，抓取所有待審核賣場
onMounted(async () => {
  await loadPendingStores();
});

// 4. 載入待審核賣場 (status = 1)
const loadPendingStores = async () => {
  try {
    const response = await storeStore.fetchPendingStores();
    pendingStores.value = response;
  } catch (error: unknown) {
    console.error('載入待審核賣場失敗:', error);

    // 使用 SweetAlert2 顯示錯誤
    Swal.fire({
      icon: 'error',
      title: '哎呀! (｡•́︿•̀｡)',
      text: '載入失敗，請稍後再試唷',
      confirmButtonColor: '#fb7299'
    });
  }
};

// 5. 審核通過
const handleApprove = async (storeId: number) => {
  const result = await Swal.fire({
    title: '確定要通過這間賣場嗎？',
    text: '',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#fb7299',
    cancelButtonColor: '#9499a0',
    confirmButtonText: '確定通過',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      await storeStore.approveStore(storeId);

      // 成功提示
      Swal.fire({
        icon: 'success',
        title: '審核通過成功！',
        text: '(๑˃ᴗ˂)ﻭ',
        confirmButtonColor: '#fb7299',
        timer: 2000
      });

      await loadPendingStores();
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

// 6. 退回賣場
const handleReject = (storeId: number) => {
  currentTargetStoreId.value = storeId;
  rejectReason.value = '';
  showRejectModal.value = true;
};

// 7. 確認退回
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
    await storeStore.rejectStore(currentTargetStoreId.value!, rejectReason.value);

    showRejectModal.value = false;

    Swal.fire({
      icon: 'success',
      title: '已成功退回賣場申請！',
      confirmButtonColor: '#fb7299',
      timer: 2000
    });

    await loadPendingStores();
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || '連線好像有點問題，請稍後再試';

    Swal.fire({
      icon: 'error',
      title: '操作失敗',
      text: errorMessage,
      confirmButtonColor: '#fb7299'
    });
  }
};

// 8. 格式化日期
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '無日期';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
};

// 9. 截斷文字
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<style scoped>
/* 延用原本的頁面內距 */
.store-review-page {
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

/* 網格佈局 */
.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 卡片與圖片框 */
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
.store-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 狀態標籤 */
.img-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}
.status-pending {
  background-color: #ffb11b;
}

/* 資訊內容區 */
.card-info {
  padding: 15px;
}
.store-name {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}
.store-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  margin: 5px 0 10px 0;
  min-height: 40px;
}
.store-desc.placeholder {
  color: #bbb;
  font-style: italic;
}
.detail-row {
  font-size: 13px;
  margin-bottom: 5px;
  color: #666;
}
.label {
  font-weight: 600;
  color: #999;
}
.value {
  color: #333;
}

/* 審核按鈕樣式 */
.card-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.approve-action-btn {
  flex: 2;
  background-color: #fb7299;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.approve-action-btn:hover {
  background-color: #ff85ad;
}

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
  text-align: center;
  padding: 100px;
  color: #bbb;
}

/* 彈窗背景遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 彈窗主體 */
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

/* 輸入框群組 */
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
  resize: none;
}

.input-group textarea:focus {
  outline: none;
  border-color: #fb7299;
}

/* 彈窗按鈕區 */
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
  background: #fb7299;
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
