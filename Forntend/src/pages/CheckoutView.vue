<template>
  <div class="checkout-container" v-if="product">
    <h2 class="page-title">確認結帳 </h2>

    <div class="checkout-layout">
      <!-- 左側:收件資訊 -->
      <div class="info-section">
        <div class="card">
          <h3><i class="icon"></i> 收件資訊</h3>
          <div class="form-group">
            <label>收件人姓名 <span class="required">*</span></label>
            <input
                type="text"
                v-model="form.receiverName"
                placeholder="請輸入真實姓名"
                :class="{ 'error': errors.receiverName }"
                @blur="validateField('receiverName')"
            >
            <span class="error-msg" v-if="errors.receiverName">{{ errors.receiverName }}</span>
          </div>

          <div class="form-group">
            <label>聯絡電話 <span class="required">*</span></label>
            <input
                type="tel"
                v-model="form.receiverPhone"
                placeholder="請輸入手機號碼 (例:0912345678)"
                :class="{ 'error': errors.receiverPhone }"
                @blur="validateField('receiverPhone')"
            >
            <span class="error-msg" v-if="errors.receiverPhone">{{ errors.receiverPhone }}</span>
          </div>

          <div class="form-group">
            <label>收件地址 <span class="required">*</span></label>
            <input
                type="text"
                v-model="form.shippingAddress"
                placeholder="請輸入完整地址"
                :class="{ 'error': errors.shippingAddress }"
                @blur="validateField('shippingAddress')"
            >
            <span class="error-msg" v-if="errors.shippingAddress">{{ errors.shippingAddress }}</span>
          </div>
        </div>

        <div class="card">
          <h3><i class="icon"></i> 付款方式</h3>
          <div class="payment-options">
            <label class="radio-label" :class="{ 'active': form.payment === 'credit' }">
              <input type="radio" value="credit" v-model="form.payment">
              <span class="radio-text">錢包餘額</span>
            </label>
<!--            <label class="radio-label" :class="{ 'active': form.payment === 'cod' }">-->
<!--              <input type="radio" value="cod" v-model="form.payment">-->
<!--              <span class="radio-text">🚚 貨到付款</span>-->
<!--            </label>-->
          </div>
        </div>
      </div>

      <!-- 右側:訂單摘要 -->
      <div class="summary-section">
        <div class="card sticky-card">
          <h3>訂單摘要</h3>
          <div class="product-item">
            <img
                :src="product.image ? `http://localhost:5275${product.image}` : 'https://i.imgur.com/6VBx3io.png'"
                :alt="product.name"
                class="mini-img"
            >
            <div class="mini-info">
              <p class="name">{{ product.name }}</p>
              <p class="price">NT$ {{ formatPrice(product.price) }}</p>
              <div class="quantity-control">
                <button class="qty-btn" @click="subQty" :disabled="qty <= 1">-</button>
                <span class="qty-num">{{ qty }}</span>
                <button class="qty-btn" @click="addQty">+</button>
              </div>
            </div>
          </div>

          <hr>

          <div class="total-row">
            <span>商品小計</span>
            <span>NT$ {{ formatPrice(product.price * qty) }}</span>
          </div>
          <div class="total-row">
            <span>運費</span>
            <span>NT$ 60</span>
          </div>
          <div class="total-row final">
            <span>應付總額</span>
            <span class="pink-text">NT$ {{ formatPrice(totalPrice) }}</span>
          </div>

          <button
              class="submit-btn"
              @click="submitOrder"
              :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="!isSubmitting">送出訂單</span>
            <span v-else>處理中...</span>
          </button>

          <p class="note">✨ 點擊送出即表示同意購買條款</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>載入中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()
const qty = ref(1)
const isSubmitting = ref(false)

// ✨ 改成 ref,不要用 computed
const product = ref<any>(null)

// 表單資料綁定
const form = ref({
  receiverName: '',
  receiverPhone: '',
  shippingAddress: '',
  payment: 'credit'
})

// 錯誤訊息
const errors = ref({
  receiverName: '',
  receiverPhone: '',
  shippingAddress: ''
})

// 驗證單一欄位
const validateField = (fieldName: string) => {
  const value = form.value[fieldName as keyof typeof form.value]

  switch(fieldName) {
    case 'receiverName':
      if (!value || value.trim() === '') {
        errors.value.receiverName = '請輸入收件人姓名'
      } else if (value.length < 2) {
        errors.value.receiverName = '姓名至少需要2個字'
      } else {
        errors.value.receiverName = ''
      }
      break

    case 'receiverPhone':
      if (!value || value.trim() === '') {
        errors.value.receiverPhone = '請輸入聯絡電話'
      } else if (!/^09\d{8}$/.test(value)) {
        errors.value.receiverPhone = '請輸入正確的手機號碼格式 (09開頭共10碼)'
      } else {
        errors.value.receiverPhone = ''
      }
      break

    case 'shippingAddress':
      if (!value || value.trim() === '') {
        errors.value.shippingAddress = '請輸入收件地址'
      } else if (value.length < 5) {
        errors.value.shippingAddress = '請輸入完整地址'
      } else {
        errors.value.shippingAddress = ''
      }
      break
  }
}

// 驗證整個表單
const validateForm = () => {
  validateField('receiverName')
  validateField('receiverPhone')
  validateField('shippingAddress')

  return !errors.value.receiverName &&
      !errors.value.receiverPhone &&
      !errors.value.shippingAddress
}

// 表單是否有效
const isFormValid = computed(() => {
  return form.value.receiverName.trim() !== '' &&
      form.value.receiverPhone.trim() !== '' &&
      form.value.shippingAddress.trim() !== ''
})

// 送出訂單
const submitOrder = async () => {
  // 驗證表單
  if (!validateForm()) {
    alert('❌ 請填寫完整且正確的收件資訊')
    return
  }

  // 防止重複送出
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    console.log('🔍 送出訂單,StoreId:', product.value.storeId)

    await storeStore.createOrder({
      storeId: product.value.storeId,
      productId:product.value.id,
      quantity:product.value.quantity,
      totalAmount: totalPrice.value,
      receiverName: form.value.receiverName,
      receiverPhone: form.value.receiverPhone,
      shippingAddress: form.value.shippingAddress
    })

    alert('✨ 訂單已送出成功!')
    router.push('/products')
  } catch (error: any) {
    const errorMsg = error.message || '訂單送出失敗,請稍後再試'
    alert(`❌ ${errorMsg}`)
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

// 數量增減
const addQty = () => {
  qty.value++
}

const subQty = () => {
  if (qty.value > 1) {
    qty.value--
  }
}

// 計算總價
const totalPrice = computed(() => {
  if (!product.value) return 0
  return (product.value.price * qty.value) + 60
})

// 格式化價格 (加千分位)
const formatPrice = (price: number) => {
  return price.toLocaleString('zh-TW')
}

// ✨ 元件載入時重新抓取商品資料
onMounted(async () => {
  try {
    const productId = Number(route.params.id)

    // 用 API 重新抓取,確保有 storeId
    product.value = await storeStore.fetchProductDetail(productId)

    console.log('🔍 結帳頁商品資料:', product.value)
    console.log('🔍 StoreId:', product.value.storeId)

  } catch (error) {
    alert('❌ 商品不存在')
    router.push('/products')
  }
})
</script>



<style scoped>
.checkout-container {
  max-width: 1000px;
  margin: 120px auto 40px;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  font-size: 18px;
  color: #666;
}

.page-title {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.required {
  color: #fb7299;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: #fb7299;
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
}

.form-group input.error {
  border-color: #ff4d4f;
}

.error-msg {
  display: block;
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 5px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-label:hover {
  border-color: #fb7299;
  background: #fff5f8;
}

.radio-label.active {
  border-color: #fb7299;
  background: #fff5f8;
}

.radio-label input[type="radio"] {
  margin-right: 10px;
  cursor: pointer;
}

.radio-text {
  font-size: 15px;
  color: #333;
}

.product-item {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

.mini-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
}

.mini-info {
  flex: 1;
}

.name {
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-size: 15px;
}

.price {
  color: #fb7299;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  font-weight: bold;
}

.qty-btn:hover:not(:disabled) {
  border-color: #fb7299;
  color: #fb7299;
  background: #fff5f8;
}

.qty-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
  background: #f5f5f5;
}

.qty-num {
  font-weight: bold;
  min-width: 30px;
  text-align: center;
  font-size: 16px;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  color: #666;
  font-size: 15px;
}

.final {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #eee;
}

.pink-text {
  color: #fb7299;
}

.submit-btn {
  width: 100%;
  background: #fb7299;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #e95d84;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.note {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.sticky-card {
  position: sticky;
  top: 100px;
}
</style>
