import {ref} from "vue";
import {depositMoney, getWalletInfo, getWalletLogs,withdrawMoney} from "@/api/wallet";

export const useWallet = () => {
    const availableBalance = ref(0)
    const escrowBalance = ref(0)
    const isLoading = ref(false)
    const error = ref<string|null>(null)
    const walletLogs = ref<any[]>([])

    // 取得錢包資料
    const fetchWallet = async () => {
        isLoading.value = true
        // error.value = null;
        try{
            const data = await getWalletInfo()
            availableBalance.value = data.availableBalance
            escrowBalance.value = data.escrowBalance
            console.log('測試',data.availableBalance)
            console.log('測試餘額',data.escrowBalance)
        }
        catch(err:any){
            err.value = '取得資料失敗';
        }
        finally{
            isLoading.value = false
        }

    }
    // 儲值
    const handleDeposit = async (amount:number) => {
        if(amount < 0){
            error.value = '金額必須大於0'
            return false
        }
        isLoading.value = true
        error.value =null
        try{
            await depositMoney(amount);
            await fetchWallet()
            await fetchWalletLogs()
            return true
        }
        catch (err:any){
            error.value = err
            return false
        }finally {
            isLoading.value = false
        }
    }
    // 提現
    const handleWithdraw = async (amount:number) => {
        if(amount < 0){
            error.value = '金額必須大於0'
            return false;
        }
        if (availableBalance.value < amount) {
            error.value = '餘額不足,無法提現';
            return false;
        }
        isLoading.value = true
        error.value =null
        try {
            await withdrawMoney(amount);
            await fetchWallet();
            await fetchWalletLogs();
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || '提現失敗';
            return false;
        } finally {
            isLoading.value = false;
        }
    }
    const fetchWalletLogs = async()=>{
        try{
            walletLogs.value = await getWalletLogs()
        }catch(err:any){
            console.error(err)
        }
    }
    return {
        availableBalance,
        escrowBalance,
        isLoading,error,
        walletLogs,
        fetchWallet,
        handleDeposit,
    fetchWalletLogs,
    handleWithdraw,}
}