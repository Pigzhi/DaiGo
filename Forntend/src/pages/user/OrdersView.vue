<template>
  <div class="orders-page">
    <div class="tab-switcher">
      <button
          v-for="tab in filterTabs"
          :key="tab.id"
          :class="['switch-btn', { active: filterStatus === tab.id }]"
          @click="filterStatus = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="orders-grid">
      <div
          v-for="order in displayOrders"
          :key="order.serviceCode"
          class="simple-card"
      >
        <div class="card-img-box">
          <img
              :src="order.imageUrl
              ? `http://localhost:5275${order.imageUrl}`
              : 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg'"
              :alt="order.title"
              class="product-img"
          >
          <span class="img-tag">{{order.status}}</span>
        </div>

        <div class="card-info">
          <h3 class="product-name">{{ order.title }}</h3>

          <div class="order-footer">
            <div class="price-details">
              <p class="product-price">總價：{{order.currency}}$ {{ order.totalAmount }}</p>
              <p class="income-text">預期收入：NT$ {{order.platformFee}}</p>
            </div>

            <span class="product-quantity">數量：{{ order.quantity }}</span>
          </div>

          <div class="card-actions">
            <template v-if="order.status === '出貨中' || order.status === '已寄出'">
              <button
                  class="ship-btn"
                  :class="{ 'is-disabled': order.status === '已寄出' }"
                  :disabled="order.status === '已寄出'"
                  @click.stop="handleShip(order.serviceCode)"
              >
                {{ order.status === '已寄出' ? '已完成出貨' : '出貨完成' }}
              </button>
            </template>

            <template v-else>
              <button
                  class="upload-btn"
                  @click.stop="openUploadModal(order.serviceCode)"
              >
                上傳收據
              </button>
            </template>

            <button
                class="detail-btn"
                @click.stop="handleViewDetail(order.serviceCode)"
            >
              查看詳情
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="displayOrders.length === 0" class="empty-box">
      目前沒有相關訂單紀錄 (｡･ω･｡)
    </div>

    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>上傳收據憑證</h3>
          <button class="close-icon" @click="closeUploadModal">✕</button>
        </div>

        <div class="input-group">
          <label>收據金額 <span class="required">*</span></label>
          <input
              v-model="uploadForm.ReceiptAmount"
              type="number"
              placeholder="請輸入收據上的購買金額"
              class="styled-input"
          />
        </div>

        <div class="input-group">
          <label>備註說明</label>
          <textarea
              v-model="uploadForm.Remark"
              placeholder="想通知委託人的是事情"
              class="styled-input textarea-fix"
          ></textarea>
        </div>

        <div class="input-group">
          <label>收據照片（請盡量裁切到能看見委託當筆商品金額） <span class="required">*</span></label>
          <div class="upload-box" @click="triggerUploadFileSelect">
            <input
                type="file"
                ref="uploadFileRef"
                accept="image/*"
                @change="handleUploadImageSelect"
                style="display: none"
            />

            <div v-if="uploadImagePreview" class="preview-container">
              <img :src="uploadImagePreview" class="preview-img" alt="預覽"/>
              <button class="remove-img-btn" @click.stop="removeUploadImage">✕</button>
            </div>

            <div v-else class="upload-placeholder">
              <span class="plus-icon">+</span>
              <span>點擊上傳圖片</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeUploadModal">取消</button>
          <button
              class="confirm-btn"
              :disabled="!uploadForm.ReceiptAmount || !uploadForm.Image"
              @click="submitUpload"
          >
            確認上傳
          </button>
        </div>
      </div>
    </div>

    <div v-if="showShipModal" class="modal-overlay" @click.self="showShipModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>填寫出貨資訊 (｡•ㅅ•｡)♡</h3>
        </div>

        <div class="input-group">
          <label>物流名稱 <span class="required">*</span></label>
          <input v-model="shipForm.LogisticsName" class="styled-input" placeholder="例如：順豐、黑貓、7-11" />
        </div>

        <div class="input-group">
          <label>物流單號</label>
          <input v-model="shipForm.TrackingNumber" class="styled-input" placeholder="請輸入追蹤編號" />
        </div>

        <div class="input-group">
          <label>備註 (選填)</label>
          <textarea v-model="shipForm.Remark" class="styled-input textarea-fix" placeholder="有什麼想對買家說的嗎？"></textarea>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showShipModal = false">取消</button>
          <button class="confirm-btn" @click="submitShip">確認出貨</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommissionStore } from "@/stores/commission";
import axios from "axios";

const commissionStore = useCommissionStore();
const currentServiceCode = ref(''); // 用來記錄現在是哪一筆訂單

// --- 狀態篩選相關 ---
const filterStatus = ref<'all' | 'unshipped' | 'shipped'>('all');
const filterTabs = [
  { id: 'all', label: '全部' },
  { id: 'unshipped', label: '未出貨' },
  { id: 'shipped', label: '已出貨' }
];

// --- 訂單資料篩選 ---
const displayOrders = computed(() => {
  const allOrders = commissionStore.acceptedCommissions;
  return allOrders.filter(order => {
    if (filterStatus.value === 'all') return true;
    if (filterStatus.value === 'shipped') return order.status === '已寄出';
    if (filterStatus.value === 'unshipped') return order.status !== '已寄出';
    return false;
  });
});

onMounted(() => {
  commissionStore.fetchMyAcceptCommissions();
});

// ============================================
// ✨ 上傳收據相關邏輯 (新版)
// ============================================
const showUploadModal = ref(false);
const uploadFileRef = ref<HTMLInputElement | null>(null);
const uploadImagePreview = ref<string | null>(null);

// 表單資料
const uploadForm = ref({
  ReceiptAmount: '',
  Remark: '',
  Image: null as File | null
});

// 1. 打開彈窗
const openUploadModal = (serviceCode: string) => {
  currentServiceCode.value = serviceCode;
  // 重置表單
  uploadForm.value = { ReceiptAmount: '', Remark: '', Image: null };
  uploadImagePreview.value = null;
  showUploadModal.value = true;
};

// 2. 關閉彈窗
const closeUploadModal = () => {
  showUploadModal.value = false;
};

// 3. 觸發檔案選擇 (點擊虛線框時)
const triggerUploadFileSelect = () => {
  uploadFileRef.value?.click();
};

// 4. 當檔案被選擇時 (產生預覽)
const handleUploadImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    uploadForm.value.Image = file;
    // 產生預覽網址
    uploadImagePreview.value = URL.createObjectURL(file);
  }
};

// 5. 移除圖片
const removeUploadImage = () => {
  uploadForm.value.Image = null;
  uploadImagePreview.value = null;
  if (uploadFileRef.value) uploadFileRef.value.value = '';
};

// 6. 送出上傳 (Call API)
// 改成這樣呼叫 Store
const submitUpload = async () => {
  if (!uploadForm.value.Image) {
    alert('請務必上傳收據照片唷！');
    return;
  }
  if (!uploadForm.value.ReceiptAmount) {
    alert('請輸入收據金額！');
    return;
  }

  // 準備 FormData
  const formData = new FormData();
  formData.append('Image', uploadForm.value.Image);
  formData.append('ReceiptAmount', uploadForm.value.ReceiptAmount);
  formData.append('Remark', uploadForm.value.Remark || '賣家上傳收據');
  // 如果後端需要日期，記得在這裡 append ReceiptDate

  try {
    // ✨ 改成呼叫 Store 的方法，把 formData 傳進去
    const result = await commissionStore.uploadReceipt(currentServiceCode.value, formData);

    if (result.success) {
      alert(result.message || '收據上傳成功囉！✨');
      closeUploadModal();
      // 重新整理列表
      await commissionStore.fetchMyAcceptCommissions();
    }
  } catch (error: any) {
    console.error('上傳失敗 Q_Q：', error);
    alert('上傳失敗：' + (error.message || '請稍後再試'));
  }
};

// ============================================
// 出貨相關邏輯 (維持原樣，但對接變數)
// ============================================
const showShipModal = ref(false);
const shipForm = ref({
  LogisticsName: '',
  TrackingNumber: '',
  Remark: ''
});

const handleShip = (serviceCode: string) => {
  currentServiceCode.value = serviceCode;
  shipForm.value = { LogisticsName: '', TrackingNumber: '', Remark: '' };
  showShipModal.value = true;
};

const submitShip = async () => {
  if (!shipForm.value.LogisticsName) {
    alert('請填寫物流名稱唷！');
    return;
  }
  try {
    const result = await commissionStore.shipCommission(currentServiceCode.value, shipForm.value);
    if (result?.success) {
      alert(result.message);
      showShipModal.value = false;
      // 重新整理列表會在 Store 裡面做，或者這裡手動呼叫
      await commissionStore.fetchMyAcceptCommissions();
    }
  } catch (error: any) {
    alert(error.message || '出貨失敗 Q_Q');
  }
};

// 查看詳情 (尚未實作跳轉，先留空)
const handleViewDetail = (serviceCode: string) => {
  console.log('查看詳情', serviceCode);
  // router.push(...)
};
</script>

<style scoped>
.orders-page {
  padding: 10px;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

/* --- Tab 切換 --- */
.tab-switcher {
  display: flex;
  background: #eee;
  padding: 4px;
  border-radius: 25px;
  width: fit-content;
  margin-bottom: 25px;
}

.switch-btn {
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  background: transparent;
  transition: all 0.3s;
}

.switch-btn.active {
  background: white;
  color: #fb7299;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* --- 網格佈局 --- */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* --- 卡片樣式 --- */
.simple-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.simple-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: #fb7299;
}

.card-img-box {
  position: relative;
  height: 160px;
  background-color: #f8f8f8;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(251, 114, 153, 0.95);
  color: white;
  font-size: 14px;
  font-weight: bold;
  padding: 5px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(251, 114, 153, 0.3);
  z-index: 1;
}

.card-info {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 20px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-price {
  color: #fb7299;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.income-text {
  font-size: 13px;
  color: #ff9800;
  font-weight: 500;
  margin: 0;
}

.product-quantity {
  color: #999;
  font-size: 16px;
}

.card-actions {
  margin-top: auto; /* 讓按鈕區塊沉底 */
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* --- 按鈕樣式 --- */
.ship-btn, .upload-btn, .detail-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 實心粉紅按鈕 (出貨/上傳) */
.ship-btn, .upload-btn {
  background-color: #fb7299;
  color: white;
  border: 1px solid #fb7299;
}

.ship-btn:hover:not(:disabled), .upload-btn:hover {
  background-color: #ff85ad;
  border-color: #ff85ad;
  transform: translateY(-2px);
}

.ship-btn.is-disabled {
  background-color: #e7e7e7;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  transform: none;
}

/* 空心粉紅按鈕 (詳情) */
.detail-btn {
  background-color: white;
  color: #fb7299;
  border: 1px solid #fb7299;
}

.detail-btn:hover {
  background-color: #fff0f3;
}

.empty-box {
  padding: 100px 0;
  text-align: center;
  color: #bbb;
}

/* ========================================= */
/* ✨ Modal 彈窗樣式 (從 Create Store 移植過來) */
/* ========================================= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px); /* 背景模糊特效 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  border: 2px solid #fff0f5;
  animation: slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-content h3 {
  margin: 0;
  color: #fb7299;
  font-size: 20px;
  font-weight: 800;
}

.close-icon {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
}
.close-icon:hover { color: #fb7299; }

/* 輸入框樣式 */
.input-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
}

.required { color: #fb7299; }

.styled-input {
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: #fafafa;
  transition: all 0.3s;
}

.styled-input:focus {
  outline: none;
  border-color: #fb7299;
  background: white;
}

.textarea-fix {
  resize: none;
  height: 80px;
}

/* 圖片上傳區塊 */
.upload-box {
  width: 100%;
  height: 180px;
  border: 2px dashed #ddd;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #fafafa;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.upload-box:hover {
  border-color: #fb7299;
  background: #fff5f7;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  gap: 8px;
}

.plus-icon { font-size: 32px; color: #ccc; }
.upload-box:hover .plus-icon { color: #fb7299; }

.preview-container { width: 100%; height: 100%; position: relative; }
.preview-img { width: 100%; height: 100%; object-fit: contain; background: #eee; }

.remove-img-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.remove-img-btn:hover { background: #fb7299; transform: scale(1.1); }

/* 彈窗按鈕 */
.modal-actions { display: flex; gap: 15px; margin-top: 10px; }

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #666;
  font-weight: 600;
}
.cancel-btn:hover { background: #e0e0e0; }

.confirm-btn {
  flex: 2;
  padding: 12px;
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
}
.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 114, 153, 0.4);
}
.confirm-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #999;
}

/* 動畫 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>