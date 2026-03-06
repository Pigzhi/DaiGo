import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<any[]>([])

    // ✨ 新增：用來記錄是否有新通知 (紅點開關)
    const hasUnread = ref(false)
    // ✨ 新增：控制橫幅的開關與內容
    const showToast = ref(false)
    const toastMessage = ref('')

    const authStore = useAuthStore()

    function addNotification(message: any) {
        notifications.value.unshift(message)
        if (notifications.value.length > 5) {
            notifications.value.pop()
        }

        // ✨ 新增：只要收到新通知，就把開關打開 (紅點亮起來！)
        hasUnread.value = true

        // ✨ 新增：觸發橫幅顯示
        // 這裡看你想顯示標題 (title) 還是內容 (content)
        showToastNotification(`收到新通知：${message.title}`)
    }
    // ✨ 新增：顯示橫幅並在 3 秒後自動關閉
    function showToastNotification(msg: string) {
        toastMessage.value = msg
        showToast.value = true

        // 設定 3000 毫秒 (3秒) 後執行
        setTimeout(() => {
            showToast.value = false
        }, 3000)
    }

    // ✨ 新增：這是一個動作，用來把紅點消掉 (當使用者打開選單時呼叫)
    function markAsRead() {
        hasUnread.value = false
    }

    async function fetchNotifications() {
        if (!authStore.token) return;

        try {
            const res = await fetch('http://localhost:5275/api/notifications', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                notifications.value = data
                // 注意：抓取歷史紀錄通常不會觸發紅點，因為那是舊的
            }
        } catch (error) {
            console.error('無法取得歷史通知:', error)
        }
    }

    // ✨ 記得把 hasUnread 和 markAsRead 也 return 出去
    return { notifications,
        addNotification,
        fetchNotifications,
        hasUnread,
        markAsRead ,
    showToast, toastMessage}
})