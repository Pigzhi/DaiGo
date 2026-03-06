import axios from 'axios'
// 新增一個api實例
const api = axios.create({
    baseURL: 'http://localhost:5275',
    timeout: 10000
    // 為什麼要timeout?
})

// 設定請求攔截器 -> 自動貼標籤機 -> 為什麼叫這個名字？
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer${token} `;
        }
        return config;
    },
    error=>{
        return Promise.reject(error);
    }
)

// 進階預留-> 如果404可以透過這裡跳轉回登入頁面

api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if (error.response && error.response.status === 401) {
            alert('登入已過期，請重新登入');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)
export default api;