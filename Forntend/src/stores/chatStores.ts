import { defineStore } from "pinia";
import * as signalR from '@microsoft/signalr'
import { ref } from 'vue'
import axios from 'axios' // ✨ 1. 記得補上 axios

export const useChatStore = defineStore('chat', () => {
    // --- State ---
    const connection = ref<signalR.HubConnection | null>(null)
    const isConnected = ref(false)

    // --- Actions ---

    // 1. 建立 SignalR 連線
    const connect = async () => {
        try {
            const token = localStorage.getItem('token')
            connection.value = new signalR.HubConnectionBuilder()
                .withUrl('http://localhost:5275/chathub', { accessTokenFactory: () => token || '' })
                .withAutomaticReconnect()
                .build()

            connection.value.on('ReceiveMessage', (data: any) => {
                console.log('收到新訊息:', data)
            })

            await connection.value.start()
            console.log('SignalR 連線成功!')
            isConnected.value = true

            await connection.value.invoke('ConnectUser')

        } catch (error) {
            console.error('SignalR 連線失敗:', error)
            isConnected.value = false
        }
    }

    // 2. 發送訊息 (SignalR)
    const sendMessage = async (chatRoomId: string, message: string) => {
        if (!connection.value || !isConnected.value) {
            console.error('SignalR 未連線')
            return
        }
        try {
            await connection.value.invoke('SendMessage', chatRoomId, message)
        } catch (error) {
            console.error('發送訊息失敗:', error)
        }
    }

    // 3. 標記已讀 (SignalR)
    const markAsRead = async (chatRoomId: string) => {
        if (!connection.value || !isConnected.value) return
        try {
            await connection.value.invoke('MarkAsRead', chatRoomId)
        } catch (error) {
            console.error('標記已讀失敗:', error)
        }
    }

    // 4. 斷開連線
    const disconnect = async () => {
        if (connection.value) {
            await connection.value.stop()
            isConnected.value = false
            console.log('SignalR 已斷線')
        }
    }

    // ✨ 5. 建立或取得聊天室 API (從 chat.ts 搬過來的！)
    const createChatRoom = async (targetUserId: string) => {
        try {
            const token = localStorage.getItem('token');
            // 呼叫後端 API
            const response = await axios.post('http://localhost:5275/api/Chat/Create', JSON.stringify(targetUserId), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            // 回傳後端給我們的資料 (包含 success 和 chatRoomId)
            return response.data;
        } catch (error) {
            console.error('建立聊天室失敗:', error);
            throw error;
        }
    }

    // --- Return ---
    return {
        connection,
        isConnected,
        connect,
        sendMessage,
        disconnect,
        markAsRead,
        createChatRoom, // ✨ 記得把他匯出，頁面才用得到喔！
    }
})