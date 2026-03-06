import axios from "axios";

const API_BASE_URL = 'http://localhost:5275/api'

// 獲取錢包資訊
export const getWalletInfo = async()=>{
    const token = localStorage.getItem("token");
    const response = await axios.get('http://localhost:5275/api/Auth/wallet', {
        headers: {Authorization: `Bearer ${token}`}
    })
    console.log(response.data)
    return response.data;
}

// 儲值
export const depositMoney = async(amount:number)=>{
    const token = localStorage.getItem("token");
    const response = await axios.post('http://localhost:5275/api/Wallet/deposit',
        {amount:amount},
        // 第一個amount -> 對應c# DTO裡面對應的詞
        // 第二個amount -> function 裡面傳進來的參數
        {headers: {Authorization: `Bearer ${token}`}
    })
}

// 獲取錢包紀錄
export const getWalletLogs = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:5275/api/Wallet/logs`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

// 提現
export const withdrawMoney = async(amount:number)=>{
    const token = localStorage.getItem("token");
    const response = await axios.post(`http://localhost:5275/api/Wallet/withdraw`,
        {amount:amount},
        {headers: {Authorization: `Bearer ${token}`}
    })
    return response.data;
}