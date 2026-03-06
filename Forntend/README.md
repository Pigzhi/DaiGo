# travel-shopper (Frontend)

> 一個基於 Vue.js 的跨境代購平台，連接買家與旅客，實現跨國商品購買服務

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 專案簡介

Proxy Buy Platform 是一個現代化的跨境代購服務平台前端專案，讓使用者能輕鬆發布代購需求或提供代購服務。本專案展示了現代前端開發的最佳實踐，包含 Google Maps API 整合、狀態管理及與 .NET Core 後端的完整串接。

> **注意：** 此為前端倉庫。後端 API 請訪問：[travel-shopper-server](https://github.com/zeronana860720/travel-shopper-server)

## 核心功能

- **Google Maps 整合**  
  實作 Places Autocomplete，讓使用者輕鬆搜尋並標記交易地點

- **互動式 UI**  
  自訂 3D 卡片元件，展示商品詳情並搭配流暢動畫效果

- **狀態管理**  
  使用 **Pinia** 進行全域狀態管理，確保元件間數據流暢通

-  **身份驗證**  
  整合 JWT (JSON Web Token) 實現安全的使用者登入與會話管理

##  技術棧

| 技術 | 用途 |
|------|------|
| **Vue 3** (Composition API) | 核心框架 |
| **Vite** | 建置工具 |
| **Pinia** | 狀態管理 |
| **Google Maps API** | 地圖服務 |
| **JavaScript (ES6+)** | 開發語言 |

## 快速開始

### 前置需求

- Node.js 16+ 
- npm 或 yarn

### 安裝步驟

1. **Clone 專案**
```sh
git clone https://github.com/zeronana860720/travel-shopper-frontend.git
cd travel-shopper-frontend
```

2. **安裝相依套件**
```sh
npm install
```

3. **設定環境變數**
```sh
# 複製 .env.example 並填入你的 Google Maps API Key
cp .env.example .env
```

4. **啟動開發伺服器**
```sh
npm run dev
```

## 📁 專案結構
```
travel-shopper-frontend/
├── src/
│   ├── components/     # Vue 元件
│   ├── views/          # 頁面視圖
│   ├── stores/         # Pinia stores
│   ├── router/         # Vue Router 設定
│   └── assets/         # 靜態資源
├── public/             # 公開資源
└── package.json
```

## 貢獻

歡迎提交 Issue 或 Pull Request！


## 👤 作者

**Cliff**  
GitHub: [@zeronana860720](https://github.com/zeronana860720)

---

如果這個專案對你有幫助，請給個星星支持！
