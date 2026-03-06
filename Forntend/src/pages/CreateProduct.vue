<template>
  <div class="product-page-layout">
    <!-- 左側表單區 -->
    <div class="form-section">
      <div class="product-card">
        <h2 class="form-title">新增商品</h2>

        <form @submit.prevent="handleSubmit">
          <!-- 商品名稱 -->
          <div class="form-group">
            <label>商品名稱 <span class="required">*</span></label>
            <input
                type="text"
                v-model="form.productName"
                placeholder="例如:東京限定草莓巧克力"
                maxlength="100"
                required
            >
          </div>

          <!-- 商品分類 -->
          <div class="form-group">
            <label>商品分類 <span class="required">*</span></label>
            <select v-model="form.category" class="custom-select" required>
              <option value="" disabled selected>請選擇商品分類</option>
              <option value="玩具公仔">玩具公仔</option>
              <option value="動漫周邊">動漫周邊</option>
              <option value="服飾配件">服飾配件</option>
              <option value="美妝保養">美妝保養</option>
              <option value="食品零食">食品零食</option>
              <option value="文具雜貨">文具雜貨</option>
              <option value="電子產品">電子產品</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <!-- 商品價格 -->
          <div class="form-group">
            <label>商品價格 (NT$) <span class="required">*</span></label>
            <input
                type="number"
                v-model.number="form.price"
                class="price-input"
                placeholder="請輸入商品價格"
                min="1"
                required
            >
          </div>

          <!-- 庫存數量 -->
          <div class="form-group">
            <label>庫存數量 <span class="required">*</span></label>
            <div class="quantity-control">
              <button type="button" class="quantity-btn minus-btn" @click="decreaseQty">−</button>
              <input
                  type="number"
                  v-model.number="form.quantity"
                  class="quantity-input"
                  min="1"
                  readonly
              >
              <button type="button" class="quantity-btn plus-btn" @click="addQty">+</button>
            </div>
          </div>

          <!-- 購買地點 -->
          <div class="form-group">
            <label>購買地點 <span class="required">*</span></label>
            <input
                ref="locationInputRef"
                type="text"
                v-model="form.location"
                placeholder="搜尋地點,例如:東京澀谷 Pokemon Center"
                required
            >
          </div>

          <!-- 商品描述 -->
          <div class="form-group">
            <label>商品描述 <span class="required">*</span></label>
            <textarea
                v-model="form.description"
                class="custom-textarea"
                maxlength="500"
                rows="4"
                placeholder="請詳細描述商品特徵、顏色、尺寸等資訊"
                required
            ></textarea>
            <small class="char-count">{{ form.description.length }} / 500 字</small>
          </div>

          <!-- 商品圖片 -->
          <div class="form-group">
            <label>商品圖片 <span class="required">*</span></label>
            <div class="upload-container">
              <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  ref="fileInputRef"
                  style="display: none"
              >
              <div v-if="!imagePreview" class="upload-placeholder" @click="() => fileInputRef?.click()">
                <span class="plus-icon">+</span>
                <span>點擊上傳商品圖片</span>
              </div>
              <div v-else class="image-preview-wrapper">
                <img :src="imagePreview" class="preview-img" alt="商品預覽">
                <button type="button" class="remove-btn" @click="removeImage">✕</button>
              </div>
            </div>
          </div>

          <!-- 結束日期 -->
          <div class="form-group">
            <label>結束日期 <span class="required">*</span></label>
            <input type="date" v-model="form.endDate" :min="today" required>
            <small class="hint">此日期後商品將自動下架</small>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '正在新增中...' : '確認新增商品' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 右側地圖區 -->
    <div class="map-section">
      <div id="map" ref="mapDivRef"></div>
      <div v-if="selectedPlace" class="map-overlay-info">
        <div class="info-header">
          <span class="pin-icon">📍</span>
          <strong>購買地點</strong>
        </div>
        <div class="place-name">{{ selectedPlace.name }}</div>
        <div class="place-address">{{ selectedPlace.address }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref as vueRef, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {useStoreStore} from "@/stores/store";

// --- 狀態定義 ---
const route = useRoute();
const router = useRouter();
const storeApi = useStoreStore()
const storeId = computed(() => Number(route.params.storeId));
const isSubmitting = vueRef(false);
const today = new Date().toISOString().split('T')[0];

const form = vueRef({
  productName: '',
  category: '',
  price: null as number | null,
  quantity: 1,
  location: '',
  description: '',
  endDate: ''
});

// --- 圖片與地圖相關 Refs ---
const fileInputRef = vueRef<HTMLInputElement | null>(null);
const locationInputRef = vueRef<HTMLInputElement | null>(null);
const mapDivRef = vueRef<HTMLDivElement | null>(null);
const imagePreview = vueRef<string | null>(null);
const selectedFile = vueRef<File | null>(null);
const selectedPlace = vueRef<{
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
} | null>(null);

let map: any = null;
let marker: any = null;

// --- 處理方法 ---
const addQty = () => form.value.quantity++;
const decreaseQty = () => {
  if (form.value.quantity > 1) form.value.quantity--;
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  imagePreview.value = null;
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// --- 初始化地圖 ---
onMounted(async () => {
  try {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
      v: "weekly",
      language: "zh-TW",
    });

    const { Map } = await importLibrary("maps") as any;
    const { AdvancedMarkerElement } = await importLibrary("marker") as any;
    const { Autocomplete } = await importLibrary("places") as any;

    map = new Map(mapDivRef.value, {
      center: { lat: 35.681236, lng: 139.767125 },
      zoom: 17,
      mapId: "DEMO_MAP_ID",
      disableDefaultUI: true
    });

    const autocomplete = new Autocomplete(locationInputRef.value, {
      fields: ["geometry", "name", "formatted_address", "place_id"],
      types: ["establishment", "geocode"]
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      map.setCenter(place.geometry.location);
      if (marker) marker.map = null;
      marker = new AdvancedMarkerElement({
        map,
        position: place.geometry.location,
        title: place.name
      });

      selectedPlace.value = {
        name: place.name || '',
        address: place.formatted_address || '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || ''
      };
      form.value.location = place.name || '';
    });
  } catch (err) {
    console.error("初始化失敗:", err);
  }
});

// --- 送出表單 ---
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // 檢查必填欄位
  if (!selectedFile.value) {
    alert('請上傳商品圖片!');
    return;
  }

  if (!selectedPlace.value) {
    alert('請選擇購買地點!');
    return;
  }

  isSubmitting.value = true;

  try {
    // 整理要傳給 Store 的資料
    const productData = {
      productName: form.value.productName,
      price: form.value.price,
      quantity: form.value.quantity,
      description: form.value.description,
      endDate: form.value.endDate,
      location: form.value.location,
      imageFile: selectedFile.value,
      category: form.value.category,

      // 地點資料
      google_place_id: selectedPlace.value.placeId,
      formatted_address: selectedPlace.value.address,
      latitude: selectedPlace.value.lat,
      longitude: selectedPlace.value.lng
    };

    // 呼叫 Pinia store 的方法
    await storeApi.createProduct(storeId.value, productData);

    alert('商品新增成功!等待審核中~ (´・ω・`)');

    // 返回賣場管理頁
    router.push(`/store/${storeId.value}/manage`);

  } catch (error: any) {
    const errorMsg = error.message || '新增失敗';
    alert(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.product-page-layout {
  display: flex;
  margin-top: 85px;
  height: calc(100vh - 100px);
  width: 100%;
  background-color: #f0f2f5;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  overflow: hidden;
}

.form-section {
  flex: 0 0 45%;
  padding: 25px 30px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border-right: 1px solid #e0e0e0;
  box-shadow: 4px 0 15px rgba(0,0,0,0.05);
}

.product-card {
  background: #ffffff;
  padding: 28px 25px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
}

.form-title {
  color: #1a1a1a;
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: 1.5px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  color: #34495e;
  font-size: 14px;
}

.required {
  color: #fb7299;
}

.form-group input:not(.quantity-input),
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  color: #2c3e50;
  background-color: #fff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #fb7299;
  box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
  outline: none;
}

.hint {
  display: block;
  margin-top: 6px;
  color: #fb7299;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}

/* 數量控制器 */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  width: fit-content;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  transition: all 0.3s ease;
}

.quantity-control:hover {
  border-color: #fb7299;
  box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background: linear-gradient(135deg, #ff92ae 0%, #fb7299 100%);
  transform: scale(1.05);
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity-input {
  width: 100px !important;
  height: 40px;
  text-align: center;
  border: none !important;
  outline: none !important;
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  background-color: #fff;
  padding: 0;
  cursor: default;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input {
  -moz-appearance: textfield;
}

/* 下拉選單 */
.custom-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fb7299' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
  cursor: pointer;
}

/* 文字輸入框 */
.custom-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  color: #2c3e50;
  background-color: #fff;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  resize: vertical;
  min-height: 100px;
  max-height: 300px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  line-height: 1.6;
}

.custom-textarea:hover {
  border-color: #fb7299;
  box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
}

.custom-textarea:focus {
  border-color: #fb7299;
  box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
  outline: none;
}

.char-count {
  display: block;
  margin-top: 6px;
  color: #7f8c8d;
  font-size: 12px;
  text-align: right;
  font-style: italic;
}

/* 圖片上傳 */
.upload-container {
  width: 150px;
  height: 150px;
  border: 3px dashed #cbd5e0;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s ease;
  background-color: #fcfcfc;
}

.upload-container:hover {
  border-color: #fb7299;
  background-color: #fff5f7;
  transform: translateY(-3px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.plus-icon {
  font-size: 50px;
  color: #a0aec0;
}

.upload-placeholder span:last-child {
  font-size: 13px;
  color: #718096;
}

.image-preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #fb7299;
  transform: scale(1.1);
}

/* 送出按鈕 */
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 15px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 15px;
  box-shadow: 0 8px 25px rgba(251, 114, 153, 0.35);
  transition: all 0.3s ease;
  letter-spacing: 2px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(251, 114, 153, 0.45);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 地圖區域 */
.map-section {
  flex: 1;
  position: relative;
  border: 4px solid #fb7299;
  border-left: none;
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.03) 0%, rgba(255, 146, 174, 0.03) 100%);
  box-shadow: inset 0 0 20px rgba(251, 114, 153, 0.08);
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.map-overlay-info {
  position: absolute;
  top: 25px;
  left: 25px;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f7 100%);
  padding: 22px 30px;
  border-radius: 10px;
  box-shadow: 0 15px 50px rgba(251, 114, 153, 0.35);
  z-index: 10;
  max-width: 360px;
  border: 2px solid #fb7299;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(251, 114, 153, 0.2);
}

.pin-icon {
  font-size: 24px;
}

.info-header strong {
  color: #fb7299;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
}

.place-name {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.6;
}

.place-address {
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.5;
  font-style: italic;
}

/* 滾動條美化 */
.form-section::-webkit-scrollbar {
  width: 8px;
}

.form-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.form-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #fb7299 0%, #ff92ae 100%);
  border-radius: 10px;
}

.form-section::-webkit-scrollbar-thumb:hover {
  background: #fb7299;
}

.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.price-input {
  -moz-appearance: textfield;
}
</style>
