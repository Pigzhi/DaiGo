<template>
  <div class="profile-card">
    <div v-if="showCropper" class="cropper-modal">
      <div class="cropper-container">
        <h3>裁切頭像</h3>
        <div class="cropper-wrapper">
          <vue-cropper
              ref="cropperRef"
              :img="rawImage"
              :autoCrop="true"
              :fixed="true"
              :fixedNumber="[1, 1]"
              outputType="png"
          />
        </div>
        <div class="cropper-btns">
          <button class="cancel-btn" @click="showCropper = false">取消</button>
          <button class="save-btn" @click="finishCrop">確認裁切</button>
        </div>
      </div>
    </div>

    <div class="card-header">
      <h2 class="title">會員資料</h2>
      <div class="action-btns">
        <template v-if="!isEditing">
          <button class="edit-btn" @click="isEditing = true">
            <i class="icon">✎</i> 編輯會員資料
          </button>
        </template>
        <template v-else>
          <button class="cancel-btn" @click="handleCancel">取消</button>
          <button class="save-btn" @click="handleSave">儲存修改</button>
        </template>
      </div>
    </div>

    <div class="info-grid">

      <div class="info-item avatar-row">
        <div class="label">我的頭像</div>
        <div class="value">
            <div class="avatar-wrapper" :class="{ 'is-editable': isEditing }" @click="triggerUpload">
            <img :src="getImageUrl(avatarPreview)" class="avatar-img" alt="nnn">
            <div v-if="isEditing" class="avatar-hint">更換</div>
          </div>
          <input type="file" ref="fileInput" accept="image/*" @change="onFileSelect" style="display: none" />
          <!--          真正的點擊更換頭貼藏在這邊,在css裡面隱藏了,要透過上面的triggerUpload來點吉他-->
        </div>
      </div>

      <div class="info-item">
        <div class="label">用戶暱稱</div>
        <div class="value">
          <input v-if="isEditing" v-model="editData.name" type="text" class="edit-input" placeholder="請輸入暱稱">
          <span v-else>{{ editData.name || '尚未設定' }}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="label">電子郵件</div>
        <div class="value">{{ editData.email || '載入中...' }}</div>
      </div>

      <div class="info-item">
        <div class="label">手機號碼</div>
        <div class="value">
          <input v-if="isEditing" v-model="editData.phone" type="text" class="edit-input" placeholder="請輸入手機">
          <span v-else>{{ editData.phone || '尚未設定' }}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="label">錢包餘額</div>
        <div class="value balance-text">NT$ {{ editData.balance.toLocaleString() }}</div>
      </div>

      <div class="info-item">
        <div class="label">密碼</div>
        <div class="value password-mask">●●●●●●●●</div>
      </div>

      <div class="info-item align-top">
        <div class="label">常用收貨地址</div>
        <div class="value">
          <textarea v-if="isEditing" v-model="editData.address" class="edit-textarea" placeholder="請輸入地址"></textarea>
          <span v-else>{{ editData.address || '尚未設定' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import axios from 'axios';
import Swal from 'sweetalert2';


// --- Data ---
const isEditing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const cropperRef = ref<any>(null);
const showCropper = ref(false);
const rawImage = ref(''); // <- 圖片暫存區
const avatarPreview = ref('');
const finalFile = ref<Blob | null>(null);

// 對應資料庫欄位的資料模型
const editData = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  balance: 0,
  avatar: ''
});

// 用於取消編輯時還原資料
// ... -> 展開資料
let backupData = { ...editData };

// --- 步驟：初始化抓取後端資料 ---
// 啟動時使用的鉤子
onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    console.log(token)
    const res = await axios.get('/api/Auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
    Object.assign(editData, res.data);
    avatarPreview.value = res.data.avatar || '';
    console.log(res.data.avatar);

    backupData = JSON.parse(JSON.stringify(editData));
  } catch (err: unknown) {  // ← 改成 unknown
    console.error('抓取資料失敗', err);

    Swal.fire({
      icon: 'error',
      title: '哎呀! (｡•́︿•̀｡)',
      text: '抓取資料失敗，請稍後再試',
      confirmButtonColor: '#fb7299'
    });
  }
});


// --- 圖片處理邏輯 ---
const triggerUpload = () => {
  if (isEditing.value) fileInput.value?.click();
};

// 上面triggerUpload點到隱藏的input以後觸發
const onFileSelect = (e: any) => {
  // e -> 事件物件 -> 點擊隱藏的 input 並選好圖片後，瀏覽器會把圖片資訊包在這個 e 裡面傳進來。
  const file = e.target.files[0];
  // files預設可以多選所以會是一個陣列 -> 選擇第一個就可以
  if (!file) return; // 防呆用的
  const reader = new FileReader(); // 實體化一個檔案讀取器
  // 把檔案內容讀成字串
  reader.onload = (event) => {
    rawImage.value = event.target?.result as string;
    showCropper.value = true;
  };
  reader.readAsDataURL(file);
};

const finishCrop = () => {
  cropperRef.value.getCropBlob((data: Blob) => {
    // 1.進行裁切
    // cropperRef -> 鉤子 -> 只要使用cropperRef.value就是等於直接操作裡面的值
    // getCropBlob -> 內建的方法把切下來的東西(data)給我

    // 2. 存下實體檔案
    // data是一個Blob -> 二進位大型檔案
    // 把它存進finalFile -> 等等寄給後端用的
    finalFile.value = data;
    // 3. 製作暫時用的預覽貼紙
    // Blob是電腦看的<img>看不懂
    // URL.createObjectURL(data) 會把這塊數據變成一個像 "blob:http://..." 的臨時網址。
    // 把它給avatarPreview.value 就可以立刻看到切好的樣子
    avatarPreview.value = URL.createObjectURL(data);
    // Blob的話img標籤不懂,轉換成他們看得懂的暫時網址
    showCropper.value = false;
    // 關閉編輯
  });
};

// --- 按鈕動作 ---
const handleSave = async () => {
  try {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('Phone', editData.phone);
    formData.append('Address', editData.address);

    if (finalFile.value) {
      formData.append('AvatarFile', finalFile.value, 'avatar.png');
    }

    const res = await axios.post('/api/Auth/update', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    // 成功提示
    Swal.fire({
      icon: 'success',
      title: '資料更新成功！',
      text: '(๑˃ᴗ˂)ﻭ',
      confirmButtonColor: '#fb7299',
      timer: 2000
    });

    if (res.data.avatarUrl) {
      editData.avatar = res.data.avatarUrl;
      avatarPreview.value = res.data.avatarUrl;
    }

    Object.assign(backupData, editData);
    isEditing.value = false;

  } catch (err: unknown) {  // ← 改成 unknown
    console.error('儲存失敗：', err);

    Swal.fire({
      icon: 'error',
      title: '儲存失敗 (´•ω•̥`)',
      text: '請稍後再試唷',
      confirmButtonColor: '#fb7299'
    });
  }
};


const handleCancel = () => {
  Object.assign(editData, backupData);
  avatarPreview.value = backupData.avatar;
  isEditing.value = false;
};

// 路徑處理函數
const  getImageUrl = (path: string) => {
  if(!path) return 'https://i.imgur.com/6VBx3io.png';
  // 沒有圖給預設圖
  // 如果是 blob: 開頭（剛裁切完的暫時預覽）或是 data: 開頭（Base64），直接回傳
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  return `http://localhost:5275${path}`;
}
</script>

<style scoped>
/* 🌸 Bilibili 主題色彩 */
.profile-card {
  --bili-pink: #fb7299;
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  width: calc(100% - 80px); /* 扣除 padding 確保寬度正確 */
  margin: 0 auto;
  text-align: left;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 25px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* --- 網格佈局 (修復排版的關鍵) --- */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-item {
  display: grid;
  grid-template-columns: 140px 1fr; /* 左邊標籤 140px，右邊內容彈性 */
  align-items: center;
}

.info-item.align-top {
  align-items: start;
}

.label {
  color: #99a2aa;
  font-size: 15px;
}

.value {
  color: #222;
  font-size: 15px;
}

/* --- 頭像樣式 --- */
.avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid #eee;
  overflow: hidden;
  position: relative;
  background-color: #f4f5f7;
}

.avatar-wrapper.is-editable {
  cursor: pointer;
  border-color: var(--bili-pink);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-hint {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
}

/* --- 表單與按鈕 --- */
.action-btns {
  display: flex;
  gap: 12px;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: 0.3s;
}

.edit-btn { background: white; color: var(--bili-pink); border-color: var(--bili-pink); }
.save-btn { background: var(--bili-pink); color: white; }
.cancel-btn { background: #f4f5f7; color: #666; }

.edit-input, .edit-textarea {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #ccd0d7;
  border-radius: 4px;
  outline: none;
}

.edit-input:focus, .edit-textarea:focus {
  border-color: var(--bili-pink);
}

.password-mask { color: #ccc; letter-spacing: 2px; }
.balance-text { font-weight: bold; color: #ffa726; }

/* --- 裁切視窗 --- */
.cropper-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}
.cropper-container { background: white; padding: 25px; border-radius: 8px; width: 420px; }
.cropper-wrapper { height: 300px; margin: 15px 0; }
.cropper-btns { display: flex; justify-content: flex-end; gap: 10px; }
</style>