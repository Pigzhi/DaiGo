import { defineStore } from 'pinia';
import axios from 'axios';
import type { Commission } from '@/types/commission';

export const useCommissionStore = defineStore('commission', {
    state: () => ({
        commissions: [] as Commission[],
        loading: false,
        currentCommission: null as Commission | null,
        acceptedCommissions: [] as any[],
        hotCommissions: [] as any[]
    }),

    actions: {
        // ... (fetchCommissions 保持不變) ...
        async fetchCommissions(params: any = {}) {
            const searchParams = typeof params === 'string' ? { keyword: params } : params;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const isSearching = searchParams.keyword || searchParams.location || searchParams.minPrice || searchParams.maxPrice || searchParams.sort;
                const url = isSearching
                    ? 'http://127.0.0.1:5275/api/Filter/search'
                    : 'http://127.0.0.1:5275/api/Commissions';

                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: searchParams
                });
                this.commissions = response.data.data;
                console.log(response.data.data);
            } catch (error) {
                console.error('篩選委託失敗:', error);
            } finally {
                this.loading = false;
            }
        },

        // ... (fetchCommissionDetail 保持不變) ...
        async fetchCommissionDetail(serviceCode: string) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://127.0.0.1:5275/api/Commissions/${serviceCode}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    this.currentCommission = response.data.data;
                }
            } catch (error) {
                console.error('抓取委託詳情失敗:', error);
                this.currentCommission = null;
            } finally {
                this.loading = false;
            }
        },

        // ... (acceptCommission 保持不變) ...
        async acceptCommission(serviceCode: string) {
            const token = localStorage.getItem('token');
            if (!token) throw { success: false, message: '找不到登入資訊，請重新登入' };
            try {
                const response = await axios.post(
                    `http://127.0.0.1:5275/Commission/${serviceCode}/accept`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return response.data;
            } catch (error: any) {
                throw error.response?.data || { success: false, message: '系統錯誤' };
            }
        },

        // ... (fetchUserManageCommissions 保持不變) ...
        async fetchUserManageCommissions() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:5275/api/Manage/Commission', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.commissions = response.data;
            } catch (error) {
                console.error('抓取管理清單失敗:', error);
            } finally {
                this.loading = false;
            }
        },

        // ... (addCommission 保持不變) ...
        async addCommission(formData: any) {
            // ... 這裡維持妳原本的程式碼，太長了我就先略過不重複貼 ...
            // 只要確保原本邏輯沒動就好
            try {
                const token = localStorage.getItem('token');
                const fd = new FormData();
                fd.append('Title', formData.itemName);
                fd.append('Description', formData.description);
                fd.append('Price', formData.price.toString());
                fd.append('Quantity', formData.quantity.toString());
                fd.append('Category', formData.category);
                fd.append('Deadline', formData.endDate);
                fd.append('Location', formData.location);
                fd.append('Currency', formData.currency);
                fd.append('Fee', formData.fee.toString());

                if (formData.google_place_id) fd.append('google_place_id', formData.google_place_id);
                if (formData.formatted_address) fd.append('formatted_address', formData.formatted_address);
                if (formData.latitude) fd.append('latitude', formData.latitude.toString());
                if (formData.longitude) fd.append('longitude', formData.longitude.toString());
                if (formData.rawImageFile) fd.append('Image', formData.rawImageFile);

                const response = await axios.post('http://127.0.0.1:5275/Commission/Create', fd, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('發佈失敗：', error);
                throw error;
            }
        },

        // ... (fetchMyAcceptCommissions 保持不變) ...
        async fetchMyAcceptCommissions() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:5275/api/Manage/Commission/MyAccept', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.acceptedCommissions = response.data;
            } catch (error) {
                console.error('抓取委託訂單失敗', error);
            } finally {
                this.loading = false;
            }
        },

        // ✨ 修正重點：上傳收據 Action
        // 1. 接收 FormData
        // 2. 修正路徑為 /Commission/... (拿掉 api/)
        // 3. 正確放置 axios 參數位置
        // ✨ 修正後的 uploadReceipt
        // 1. 記得參數要接收 formData
        // 2. 記得要有 return response.data
        async uploadReceipt(serviceCode: string, formData: FormData) {
            try {
                const token = localStorage.getItem('token');

                // 發送請求
                const response = await axios.post(
                    `http://127.0.0.1:5275/Commission/${serviceCode}/receipt`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                // ✨✨✨ 關鍵在這裡！一定要把結果 return 出去！ ✨✨✨
                return response.data;

            } catch (error: any) {
                console.error('上傳收據失敗:', error);
                // 把錯誤丟出去，這樣 Vue 頁面的 catch 才能抓到
                throw error.response?.data || { success: false, message: '上傳失敗' };
            }
        },

        // ... (deleteCommission 保持不變) ...
        async deleteCommission(serviceCode: string) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://127.0.0.1:5275/Commission/${serviceCode}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    await this.fetchUserManageCommissions();
                    return { success: true, message: response.data.message };
                }
            } catch (error: any) {
                console.error('刪除委託失敗:', error);
                throw error.response?.data || { success: false, message: '刪除失敗，請稍後再試' };
            }
        },

        // ... (shipCommission 保持不變) ...
        async shipCommission(serviceCode: string, shipData: { LogisticsName: string, TrackingNumber?: string, Remark?: string }) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `http://127.0.0.1:5275/Commission/${serviceCode}/ship`,
                    shipData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    await this.fetchMyAcceptCommissions();
                    return { success: true, message: response.data.message };
                }
            } catch (error: any) {
                console.error('出貨失敗:', error);
                throw error.response?.data || { success: false, message: '出貨失敗，請稍後再試' };
            }
        },

        // ... (completeCommission 保持不變) ...
        async completeCommission(serviceCode: string) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `http://127.0.0.1:5275/Commission/${serviceCode}/complete`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const index = this.commissions.findIndex(c => c.serviceCode === serviceCode);
                    if (index !== -1) {
                        this.commissions[index].status = '已完成';
                    }
                    return { success: true, message: response.data.message };
                }
            } catch (error: any) {
                console.error('完成訂單失敗：', error);
                throw error.response?.data || { message: '連線伺服器失敗' };
            }
        },

        // ... (reviewCommission 保持不變) ...
        async reviewCommission(serviceCode: string, isPass: boolean, reason: string = '') {
            // ... 略 ...
            try {
                const response = await axios.post('http://127.0.0.1:5275/admin/Review/Pending', {
                    targetType: "commission",
                    targetCode: serviceCode,
                    result: isPass ? 1 : 0,
                    reason: reason
                });
                return { success: response.status === 200 };
            } catch (error: any) {
                throw new Error(error.response?.data?.message || '審核程序出錯了');
            }
        },

        // ... (fetchHotCommissions 保持不變) ...
        async fetchHotCommissions() {
            // ... 略 ...
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:5275/api/Commissions/Hot', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    this.hotCommissions = response.data.data;
                }
            } catch (error) {
                console.error('抓取熱門委託失敗:', error);
            } finally {
                this.loading = false;
            }
        },

        // ✨ 修正重點：獲取收據 (查看用)
        // 這個是用 GET，且是查看資料，所以路徑要有 /api/
        // 如果妳在 Vue 裡面直接用 axios，記得這裡也要補上完整網址比較保險
        async fetchCommissionReceipt(serviceCode: string) {
            try {
                // 補上完整 Domain 避免路徑錯誤
                const response = await axios.get(`http://127.0.0.1:5275/api/Commissions/${serviceCode}/receipt`);

                if (response.data.success) {
                    return response.data.data;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error: any) {
                console.error('獲取收據失敗:', error);
                throw error.response?.data?.message || '無法讀取收據資料';
            }
        },
    }
});