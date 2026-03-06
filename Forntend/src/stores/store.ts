import { defineStore } from 'pinia';
import axios from 'axios';

interface StoreItem {
    storeId: number;
    storeName: string;
    status: number;
    storeImage?: string;
    createdAt: string;
    reviewFailCount: number;
    storeDescription: string;
    location: string;
    category: string;
}

export const useStoreStore = defineStore('store', {
    state: () => ({
        stores: [] as StoreItem[],
        sellerOrders: [] as any[],
        buyerOrders: [] as any[],
        loading: false
    }),

    actions: {
        // 抓我的賣場
        async fetchMyStores() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:5275/api/createstore/my/mystore', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.stores = response.data;
            } catch (error) {
                console.error('抓取賣場失敗:', error);
            } finally {
                this.loading = false;
            }
        },

        // 建立賣場
        async createStore(formData: FormData) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('http://127.0.0.1:5275/api/createstore/my/store', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                await this.fetchMyStores();
                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '建立失敗' };
            }
        },

        // 送出賣場審核
        async submitStoreForReview(storeId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/submit`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                await this.fetchMyStores();
                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '送出審核失敗' };
            }
        },

        // ✨ 新增:建立商品
        // ✨ 新增:建立商品
        async createProduct(storeId: number, productData: any) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const formData = new FormData();

                // 基本資料
                formData.append('ProductName', productData.productName);
                formData.append('Price', productData.price.toString());
                formData.append('Quantity', productData.quantity.toString());
                formData.append('Description', productData.description);
                formData.append('EndDate', productData.endDate);

                // Category
                if (productData.category) {
                    formData.append('Category', productData.category);
                }

                // 圖片檔案
                if (productData.imageFile) {
                    formData.append('Image', productData.imageFile);
                }

                // 地點資料
                if (productData.google_place_id) {
                    formData.append('GooglePlaceId', productData.google_place_id);
                    formData.append('LocationName', productData.location || '');
                    formData.append('FormattedAddress', productData.formatted_address || '');
                    formData.append('Latitude', productData.latitude.toString());
                    formData.append('Longitude', productData.longitude.toString());
                }

                // ✓ 改:改成跟其他方法一樣用 createstore
                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/products`,
                    //                              ^^^^^^^^^^^ 改成 createstore
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '新增商品失敗' };
            }
        },

        // 取得賣場商品列表
        async fetchStoreProducts(storeId: number) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/products`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log(response.data);
                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '取得商品失敗' };
            }
        },
        // 取得所有待審核商品 (管理員用)
        async fetchPendingProducts() {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.get(
                    'http://127.0.0.1:5275/api/review/products/newpending',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '取得待審核商品失敗' };
            }
        },
        // 取得所有待審核賣場
        async fetchPendingStores() {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.get(
                    'http://127.0.0.1:5275/api/review/storepending',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '取得待審核賣場失敗' };
            }
        },

        // 審核通過商品
        async approveProduct(productId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/review/products/${productId}/approveproduct`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '審核通過失敗' };
            }
        },
        // 退回商品
        async rejectProduct(productId: number, reason: string) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/review/products/${productId}/rejectproduct`,
                    { comment: reason },  // ← 後端期望的欄位名是 comment
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '退回商品失敗' };
            }
        },
        // 審核通過賣場
        async approveStore(storeId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/review/${storeId}/storeapprove`,
                    {},  // ← 空物件就好,不需要傳 comment
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '審核通過失敗' };
            }
        },

// 退回賣場
        async rejectStore(storeId: number, reason: string) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/review/${storeId}/rejectstore`,
                    { comment: reason },  // ← 注意是小寫的 comment 唷!
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '退回賣場失敗' };
            }
        },
        // 更新賣場
        async updateStore(storeId: number, formData: FormData) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.put(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/update`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                            // 不用手動設定 Content-Type，axios 會自動處理 FormData
                        }
                    }
                );

                // 更新成功後重新抓取賣場列表
                await this.fetchMyStores();

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '更新賣場失敗' };
            }
        },

        // 關閉賣場
        async closeStore(storeId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/close`,
                    {},  // POST 但不需要 body
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // 成功後重新抓取賣場列表
                await this.fetchMyStores();

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '關閉賣場失敗' };
            }
        },
        // 重新啟用賣場
        async reopenStore(storeId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/${storeId}/reopen`,
                    {},  // POST 但不需要 body
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // 成功後重新抓取賣場列表
                await this.fetchMyStores();

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '啟用賣場失敗' };
            }
        },

        // 取得所有上架中的商品 (不需要登入)
        async fetchAllProducts() {
            this.loading = true;
            try {
                const response = await axios.get(
                    'http://127.0.0.1:5275/api/createstore/allproducts'
                );
                console.log(response.data);
                return response.data;
            } catch (error: any) {
                console.error('取得商品列表失敗:', error);
                throw error.response?.data || { message: '取得商品列表失敗' };
            } finally {
                this.loading = false;
            }
        },
        // 在 useStoreStore 裡面加上這個
        async fetchProductDetail(productId: number) {
            this.loading = true;
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5275/api/createstore/products/${productId}`
                );
                console.log('測試',response.data);
                return response.data;
            } catch (error: any) {
                console.error('取得商品詳情失敗:', error);
                throw error.response?.data || { message: '取得商品詳情失敗' };
            } finally {
                this.loading = false;
            }
        },

        // 建立訂單 (需要登入)
        async createOrder(orderData: {
            storeId: number;
            productId: number;
            quantity: number;
            totalAmount: number;
            receiverName: string;
            receiverPhone: string;
            shippingAddress: string;

        }) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    'http://127.0.0.1:5275/api/createstore/orders',
                    orderData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '訂單建立失敗' };
            }
        },
        // ==========================================
        // ✨ 新增區塊: 賣家訂單管理功能
        // ==========================================

        // 1. 取得賣家收到的所有訂單
        async fetchSellerOrders() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');

                if (!token) return; // 如果沒登入就不用抓了

                const response = await axios.get(
                    'http://127.0.0.1:5275/api/createstore/my/orders',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // 把抓回來的資料存進 State
                this.sellerOrders = response.data;

                return response.data;
            } catch (error: any) {
                console.error('抓取賣家訂單失敗:', error);
                // 這裡我們不 throw error，因為可能是剛好沒訂單，不影響頁面運作
            } finally {
                this.loading = false;
            }
        },

        // 2. 執行出貨
        async shipOrder(orderId: number, shipData: { LogisticsName: string, TrackingNumber: string }) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                // 呼叫出貨 API
                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/orders/${orderId}/ship`,
                    shipData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '出貨失敗' };
            }
        },

        // ==========================================
        // ✨ 新增區塊: 買家訂單功能 (我的購買清單)
        // ==========================================

        // 1. 取得買家自己的購買清單
        async fetchBuyerOrders() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');

                if (!token) return;

                const response = await axios.get(
                    'http://127.0.0.1:5275/api/createstore/my/purchases',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // 存入 State
                this.buyerOrders = response.data;

                return response.data;
            } catch (error: any) {
                console.error('抓取買家訂單失敗:', error);
            } finally {
                this.loading = false;
            }
        },

        // 2. 買家完成訂單 (確認收貨)
        async completeOrder(orderId: number) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return Promise.reject({ message: '請先登入' });
                }

                const response = await axios.post(
                    `http://127.0.0.1:5275/api/createstore/orders/${orderId}/complete`,
                    {}, // POST 請求 body 為空
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                return response.data;
            } catch (error: any) {
                throw error.response?.data || { message: '操作失敗' };
            }
        },




    }
});
