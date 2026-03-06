<template>
  <div class="store-manage-page">
    <!-- 賣場資訊卡片 -->
    <div class="store-info-card">
      <!-- 左側:圖片+名稱 -->
      <button class="edit-store-btn" @click="openEditModal">
        <span class="edit-icon"></span>
        編輯賣場資訊
      </button>
      <div class="store-left">
        <div class="store-image-box">
          <img
              :src="currentStore?.storeImage
          ? `http://127.0.0.1:5275${currentStore.storeImage}`
          : defaultImage"
              :alt="currentStore?.storeName"
              class="store-cover"
          >
        </div>
        <div class="store-basic">
          <h2 class="store-name">{{ currentStore?.storeName }}</h2>
          <div class="store-meta">
            <span class="status-badge" :class="getStatusClass(currentStore?.status)">
              {{ getStatusLabel(currentStore?.status) }}
            </span>
            <span class="created-date">建立於 {{ formatDate(currentStore?.createdAt) }}</span>
            <!-- ✨ 草稿狀態才顯示送審按鈕 -->
            <button
                v-if="currentStore?.status === 0"
                class="submit-review-btn"
                @click="handleSubmitReview"
            >
              送出審核
            </button>
          </div>
        </div>
      </div>

      <!-- 右側:描述 -->
      <div class="store-right">
        <h3 class="section-title">賣場介紹</h3>
        <p class="store-description" v-if="currentStore?.storeDescription">
          {{ currentStore.storeDescription }}
        </p>
        <p class="store-description placeholder" v-else>
          這間店主很神祕,還沒寫下任何介紹唷 (๑• . •๑)
        </p>
      </div>
    </div>

    <!-- 商品列表區 -->
    <div class="products-section">
      <div class="section-header">
        <div class="header-left">
          <h3 class="products-title">商品列表</h3>
          <span class="products-count">共 {{ products.length }} 件商品</span>
        </div>
        <button class="add-product-btn" @click="openAddProductModal">
          <span class="plus-icon">+</span>
          新增商品
        </button>
      </div>

      <!-- 篩選按鈕區 -->
      <div class="tab-switcher">
        <div class="tab-group">
          <button
              :class="['switch-btn', { active: activeFilter === 'all' }]"
              @click="setFilter('all')"
          >
            全部
          </button>
          <button
              :class="['switch-btn', { active: activeFilter === 'on-sale' }]"
              @click="setFilter('on-sale')"
          >
            已上架
          </button>
        </div>

        <div class="tab-group">
          <button
              :class="['switch-btn', { active: activeFilter === 'pending' }]"
              @click="setFilter('pending')"
          >
            審核中
          </button>
          <button
              :class="['switch-btn', { active: activeFilter === 'failed' }]"
              @click="setFilter('failed')"
          >
            審核失敗
          </button>
        </div>
      </div>

      <!-- 商品網格 -->
      <div class="products-grid">
        <div
            v-for="product in filteredProducts"
            :key="product.productId"
            class="product-card"
            @click="handleProductClick(product.productId)"
        >
          <div class="product-image">
            <img
                :src="product.imageUrl || defaultProductImage"
                :alt="product.productName"
            >
            <span class="product-status-tag" :class="getProductStatusClass(product)">
              {{ getProductStatusLabel(product) }}
            </span>
          </div>

          <div class="product-body">
            <h4 class="product-name">{{ product.productName }}</h4>
            <div class="product-info-row">
              <span class="product-price">NT$ {{ formatNumber(product.price) }}</span>
            </div>
            <div class="product-info-row">
              <span class="product-stock">庫存：{{ product.stock }}</span>
            </div>
            <button class="edit-product-btn" @click.stop="handleEditProduct(product.productId)">
              編輯商品
            </button>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="products.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p class="empty-text">還沒有商品唷~快來新增第一個商品吧! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧</p>
      </div>
    </div>

    <!-- 新增商品彈窗 (預留) -->
    <div v-if="showAddProductModal" class="modal-overlay" @click.self="showAddProductModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>新增商品</h3>
          <button class="close-icon" @click="showAddProductModal = false">✕</button>
        </div>
        <p style="text-align: center; color: #999; padding: 40px;">
          商品表單開發中... (๑•̀ㅂ•́)و✧
        </p>
      </div>
    </div>

    <!-- 編輯賣場彈窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content edit-modal">
        <div class="modal-header">
          <h3>編輯賣場資訊</h3>
          <button class="close-icon" @click="showEditModal = false">✕</button>
        </div>

        <div class="input-group">
          <label>賣場名稱 <span class="required">*</span></label>
          <input
              v-model="editStoreForm.storeName"
              placeholder="輸入賣場名稱"
              maxlength="100"
              class="styled-input"
          />
        </div>

        <div class="input-group">
          <label>賣場描述</label>
          <textarea
              v-model="editStoreForm.storeDescription"
              placeholder="簡單介紹一下你的賣場吧！"
              rows="4"
              class="styled-input textarea-fix"
          ></textarea>
        </div>

        <div class="input-group">
          <label>賣場封面</label>
          <div class="upload-box" @click="triggerFileSelect">
            <input
                type="file"
                ref="storeImageFileRef"
                accept="image/*"
                @change="handleImageSelect"
                style="display: none"
            />

            <div v-if="imagePreview" class="preview-container">
              <img :src="imagePreview" class="preview-img" alt=""/>
              <button class="remove-img-btn" @click.stop="removeImage">✕</button>
            </div>

            <div v-else class="upload-placeholder">
              <span class="plus-icon">+</span>
              <span>點擊上傳封面圖</span>
            </div>
          </div>
        </div>

        <div class="modal-actions-with-delete">
          <!-- 根據賣場狀態顯示不同按鈕 -->
          <button
              v-if="currentStore?.status === 5"
              class="reopen-btn"
              @click="handleReopenStore"
          >
            重新啟用
          </button>
          <button
              v-else
              class="delete-btn"
              @click="handleDeleteStore"
          >
            關閉賣場
          </button>

          <div class="right-actions">
            <button class="cancel-btn" @click="showEditModal = false">取消</button>
            <button
                class="confirm-btn"
                :disabled="!editStoreForm.storeName.trim()"
                @click="handleSaveEdit"
            >
              儲存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStoreStore } from '@/stores/store';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const store = useStoreStore();

// --- 狀態定義 ---
const storeId = computed(() => Number(route.params.storeId));
const currentStore = ref<any>(null);
const products = ref<any[]>([]);
const showAddProductModal = ref(false);

// 編輯賣場用的狀態
const showEditModal = ref(false);
const storeImageFileRef = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

const editStoreForm = ref({
  storeName: '',
  storeDescription: '',
  storeImage: null as File | null
});

const defaultImage = 'https://i.pinimg.com/1200x/f7/d1/36/f7d136d44bbad6846e1385711a6a634b.jpg';
const defaultProductImage = 'https://i.imgur.com/6VBx3io.png';

// 篩選狀態
const activeFilter = ref<string>('all');

// --- 篩選商品 ---
const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') return products.value;

  return products.value.filter(product => {
    if (activeFilter.value === 'draft') return product.status === 0;
    if (activeFilter.value === 'pending') return product.status === 1;
    if (activeFilter.value === 'failed') return product.status === 2;
    if (activeFilter.value === 'on-sale') return product.status === 3;
    if (activeFilter.value === 'off-sale') return product.status === 3 && product.isActive === false;
    return false;
  });
});

// 切換篩選
const setFilter = (filter: string) => {
  activeFilter.value = filter;
};

// --- 生命週期 ---
onMounted(async () => {
  await loadStoreData();
  await loadProducts();
});

// --- 資料載入 ---
const loadStoreData = async () => {
  await store.fetchMyStores();
  currentStore.value = store.stores.find(s => s.storeId === storeId.value);

  if (!currentStore.value) {
    Swal.fire({
      icon: 'error',
      title: '找不到此賣場！',
      confirmButtonColor: '#fb7299'
    });
    router.push('/shop');
  }
};

const loadProducts = async () => {
  try {
    const response = await store.fetchStoreProducts(storeId.value);
    products.value = response.products.map((p: any) => ({
      productId: p.productId,
      productName: p.productName,
      price: p.price,
      stock: p.quantity,
      status: p.status,
      isActive: p.isActive,
      imageUrl: p.imagePath ? `http://127.0.0.1:5275${p.imagePath}` : null
    }));
  } catch (error) {
    console.error('載入商品失敗:', error);
    Swal.fire({
      icon: 'error',
      title: '載入商品失敗',
      confirmButtonColor: '#fb7299'
    });
  }
};

// --- 輔助函式 ---
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '無日期';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  return num.toLocaleString();
};

const getStatusLabel = (status: number | undefined) => {
  switch (status) {
    case 0: return '草稿';
    case 1: return '審核中';
    case 2: return '發布失敗';
    case 3: return '已發布';
    case 4: return '停權';          // ← 加這行
    case 5: return '已關閉';        // ← 加這行
    default: return '未知';
  }
};

const getStatusClass = (status: number | undefined) => {
  switch (status) {
    case 3: return 'published';
    case 1: return 'pending';
    case 2: return 'failed';
    case 0: return 'draft';
    case 4: return 'banned';        // ← 加這行
    case 5: return 'closed';        // ← 加這行
    default: return 'pending';
  }
};

const getProductStatusLabel = (product: any) => {
  if (product.status === 0) return '草稿';
  if (product.status === 1) return '審核中';
  if (product.status === 2) return '審核失敗';
  if (product.status === 3) return '已上架';
  if (product.status === 4) return '已下架';
  if (product.status === 5) return '已撤回';
  return '未知';
};


const getProductStatusClass = (product: any) => {
  if (product.status === 0) return 'draft';
  if (product.status === 1) return 'pending';
  if (product.status === 2) return 'failed';
  if (product.status === 3) return 'on-sale';
  if (product.status === 4) return 'off-sale';
  if (product.status === 5) return 'withdrawn';
  return 'pending';
};


// --- 操作函式 ---
const openAddProductModal = () => {
  router.push(`/store/${storeId.value}/product/create`);
};

const handleProductClick = (productId: number) => {
  console.log('點擊商品:', productId);
};

const handleEditProduct = (productId: number) => {
  console.log('編輯商品:', productId);
};

// 處理送出審核
const handleSubmitReview = async () => {
  const result = await Swal.fire({
    title: '確定要送出審核嗎？',
    text: '送出後將無法編輯，需等待管理員審核唷',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#fb7299',
    cancelButtonColor: '#9499a0',
    confirmButtonText: '確定送出 ✨',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      await store.submitStoreForReview(storeId.value);

      Swal.fire({
        icon: 'success',
        title: '送出審核成功！',
        text: '請等待管理員審核唷~ (๑˃ᴗ˂)ﻭ',
        confirmButtonColor: '#fb7299',
        timer: 2000
      });

      await loadStoreData();
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || '送出審核失敗';

      Swal.fire({
        icon: 'error',
        title: '送出失敗 (´•ω•̥`)',
        text: errorMessage,
        confirmButtonColor: '#fb7299'
      });
    }
  }
};

// --- 編輯賣場相關 ---

// 打開編輯彈窗
const openEditModal = () => {
  if (!currentStore.value) return;

  editStoreForm.value.storeName = currentStore.value.storeName || '';
  editStoreForm.value.storeDescription = currentStore.value.storeDescription || '';
  editStoreForm.value.storeImage = null;

  imagePreview.value = currentStore.value.storeImage
      ? `http://127.0.0.1:5275${currentStore.value.storeImage}`
      : null;

  showEditModal.value = true;
};

// 觸發檔案選擇
const triggerFileSelect = () => {
  storeImageFileRef.value?.click();
};

// 處理圖片選擇
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editStoreForm.value.storeImage = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

// 移除圖片
const removeImage = () => {
  editStoreForm.value.storeImage = null;
  imagePreview.value = null;
  if (storeImageFileRef.value) storeImageFileRef.value.value = '';
};

// 儲存編輯
const handleSaveEdit = async () => {
  if (!editStoreForm.value.storeName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: '請填寫賣場名稱唷！',
      text: '(´・ω・`)',
      confirmButtonColor: '#fb7299'
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append('storeId', storeId.value.toString());
    formData.append('storeName', editStoreForm.value.storeName);

    if (editStoreForm.value.storeDescription) {
      formData.append('storeDescription', editStoreForm.value.storeDescription);
    }

    if (editStoreForm.value.storeImage) {
      formData.append('storeImage', editStoreForm.value.storeImage);
    }


    await store.updateStore(storeId.value, formData);

    Swal.fire({
      icon: 'success',
      title: '賣場資料更新成功！',
      text: '(๑˃ᴗ˂)ﻭ',
      confirmButtonColor: '#fb7299',
      timer: 2000
    });

    showEditModal.value = false;
    await loadStoreData();

  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || '更新失敗';

    Swal.fire({
      icon: 'error',
      title: '更新失敗 (´•ω•̥`)',
      text: errorMessage,
      confirmButtonColor: '#fb7299'
    });
  }
};

// 刪除賣場
// ✨ 關閉賣場 (原本的刪除改成關閉)
const handleDeleteStore = async () => {
  const result = await Swal.fire({
    title: '確定要關閉這個賣場嗎？',
    text: '關閉後賣場和所有商品都會下架唷！(｡•́︿•̀｡)',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4d4f',
    cancelButtonColor: '#9499a0',
    confirmButtonText: '確定關閉',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      await store.closeStore(storeId.value);

      Swal.fire({
        icon: 'success',
        title: '賣場已關閉',
        text: '所有商品已下架 (๑˃ᴗ˂)ﻭ',
        confirmButtonColor: '#fb7299',
        timer: 2000
      });

      router.push({name:'Shops'});

    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || '關閉失敗';

      Swal.fire({
        icon: 'error',
        title: '關閉失敗 (´•ω•̥`)',
        text: errorMessage,
        confirmButtonColor: '#fb7299'
      });
    }
  }
};

// 重新啟用賣場
const handleReopenStore = async () => {
  const result = await Swal.fire({
    title: '確定要重新啟用賣場嗎？',
    text: '',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#fb7299',
    cancelButtonColor: '#9499a0',
    confirmButtonText: '確定啟用',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      await store.reopenStore(storeId.value);

      Swal.fire({
        icon: 'success',
        title: '賣場已重新啟用！',
        text: '(๑˃ᴗ˂)ﻭ',
        confirmButtonColor: '#fb7299',
        timer: 2000
      });

      showEditModal.value = false;
      await loadStoreData();

    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || '啟用失敗';

      Swal.fire({
        icon: 'error',
        title: '啟用失敗 (´•ω•̥`)',
        text: errorMessage,
        confirmButtonColor: '#fb7299'
      });
    }
  }
};

</script>


<style scoped>
.store-manage-page {
  max-width: 100%;
  margin: 110px auto 20px;
  padding: 0 20px;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

/* --- 賣場資訊卡片 --- */
.store-info-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  gap: 40px;
  position: relative;
}

/* 左側:圖片+名稱 */
.store-left {
  display: flex;
  gap: 20px;
  align-items: center;
  min-width: 400px;
}

.store-image-box {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.store-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-basic {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.store-name {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.store-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.status-badge.published { background: #fb7299; }
.status-badge.pending { background: #ffb11b; }
.status-badge.failed { background: #9499a0; }
.status-badge.draft { background: #00aeec; }

.created-date {
  font-size: 14px;
  color: #999;
}

/* 右側:描述 */
.store-right {
  flex: 1;
  padding: 10px 0;
}

.section-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
}

.store-description {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  margin: 0;
}

.store-description.placeholder {
  color: #bbb;
  font-style: italic;
}

/* --- 商品列表區 --- */
.products-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.products-title {
  font-size: 20px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.products-count {
  font-size: 14px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 20px;
}

.add-product-btn {
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(251, 114, 153, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 114, 153, 0.4);
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

/* --- 商品網格 (4格) --- */
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);  /* 改成 5 個 */
  gap: 16px;  /* 間距可以稍微縮小一點 */
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-color: #ffdae3;
}

.product-image {
  height: 180px;
  position: relative;
  background: #f8f8f8;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.product-status-tag.on-sale { background: #fb7299; }
.product-status-tag.off-sale { background: #9499a0; }

.product-body {
  padding: 12px;
}

.product-name {
  font-size: 15px;
  color: #333;
  margin: 0 0 10px 0;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 600;
}

.product-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
}

.product-price {
  color: #fb7299;
  font-weight: bold;
  font-size: 17px;
}

.product-stock {
  color: #666;
  font-size: 13px;
}

.edit-product-btn {
  width: 100%;
  margin-top: 10px;
  background: #fff5f7;
  color: #fb7299;
  border: 1px solid #ffdae3;
  padding: 8px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.edit-product-btn:hover {
  background: #fb7299;
  color: white;
}

/* --- 空狀態 --- */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #bbb;
}

/* --- 彈窗 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
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
  max-width: 500px;
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

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- 響應式 (選配) --- */
@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .store-info-card {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.edit-store-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #fff5f7;
  color: #fb7299;
  border: 1px solid #ffdae3;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.edit-store-btn:hover {
  background: #fb7299;
  color: white;
}

.edit-icon {
  font-size: 16px;
}
.submit-review-btn {
  background: linear-gradient(135deg, #00aeec 0%, #5bc0de 100%);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 174, 236, 0.3);
}

.submit-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 174, 236, 0.5);
}

.product-status-tag.draft { background: #00aeec; }      /* 草稿 - 藍色 */
.product-status-tag.pending { background: #ffb11b; }    /* 審核中 - 橘色 */
.product-status-tag.failed { background: #9499a0; }     /* 審核失敗 - 灰色 */
/* 篩選按鈕區 */

/* --- 切換鈕 --- */
.tab-switcher {
  display: flex;
  justify-content: space-between; /* 讓兩組群組一左一右 */
  align-items: center;
  width: 100%;
  margin-bottom: 25px;
}

.tab-group {
  display: flex;
  background: #eee;             /* 灰色背景包住整組按鈕 */
  padding: 4px;
  border-radius: 25px;
}

.switch-btn {
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  background: transparent;      /* 預設透明背景 */
  transition: all 0.3s;
}

.switch-btn.active {
  background: white;            /* 選中時變白色 */
  color: #fb7299;               /* 粉紅色文字 */
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
/* 編輯彈窗專用樣式 */
.edit-modal {
  max-width: 420px !important;
}

.input-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
}

.required {
  color: #fb7299;
}

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
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

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

.plus-icon {
  font-size: 32px;
  color: #ccc;
  transition: color 0.3s;
}

.upload-box:hover .plus-icon {
  color: #fb7299;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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
  transition: all 0.3s;
}

.remove-img-btn:hover {
  background: #fb7299;
  transform: scale(1.1);
}

.modal-actions-with-delete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 12px;
}

.delete-btn {
  padding: 12px 20px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 14px;
}

.delete-btn:hover {
  background: #ff7875;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
}

.right-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  padding: 12px 20px;
  background: #f0f0f0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #666;
  font-weight: 600;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 114, 153, 0.4);
}

.confirm-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #999;
  transform: none;
}
.status-badge.banned { background: #333; }      /* 停權 - 黑色 */
.status-badge.closed { background: #999; }      /* 已關閉 - 灰色 */

.reopen-btn {
  padding: 12px 20px;
  background: #52c41a;  /* 綠色 */
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 14px;
}

.reopen-btn:hover {
  background: #73d13d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}
.product-status-tag.withdrawn { background: #9499a0; }      /* 已撤回 - 灰色 */
.product-status-tag.store-closed { background: #666; }      /* 賣場關閉 - 深灰色 */
.product-status-tag.store-closed {
  background: #666;
  color: white;
}

</style>
