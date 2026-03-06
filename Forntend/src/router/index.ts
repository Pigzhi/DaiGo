import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import Product from "@/pages/Product.vue";
import Register from "@/pages/Register.vue";
import Login from "@/pages/Login.vue";
import HomePage from "@/pages/HomePage.vue";


const routes:RouteRecordRaw[] = [
    {
        path:'/homepage',
        name:'Homepage',
        component:HomePage,
    },
    {
        path:'/products',
        name:'Product',
        component:Product,
    },
    {
        path:'/LogIn',
        name:'LogIn',
        component:Login
    },
    {
        path:'/register',
        name:'Register',
        component:Register,
    },
    {
        path: '/product/:id', // :id 是一個動態參數，代表商品編號
        name: 'ProductDetail',
        component: () => import('../pages/ProductDetail.vue') // 懶加載詳情頁
    },
    {
        path: '/checkout/:id',
        name: 'Checkout',
        component: () => import('../pages/CheckoutView.vue') // 懶加載結帳頁
    },
    {
        path: '/create-commission',
        name: 'CreateCommission',
        component: () => import('../pages/CreateCommission.vue')
    },
    {
        path: '/commissions',
        name: 'Commissions',
        // ✨ 使用我們剛才聊過的「懶加載」，只有點到這頁才下載檔案
        component: () => import('../pages/CommissionsView.vue')
    },
    {
        path:'/commissions/:id',
        name:'commissions-detail',
        component: () => import('../pages/CommissionDetail.vue')
    },
    // 賣場管理路由
    {
        path: '/store/:storeId/manage',
        name: 'StoreManage',
        component: () => import('../pages/user/StoreManage.vue')
    },
    // 創建商品路由
    {
        path: '/store/:storeId/product/create',
        name: 'CreateProduct',
        component: () => import('../pages/CreateProduct.vue')
    },
    // --- 新增：會員中心嵌套路由 ---
    {
        path: '/user',
        name: 'UserLayout',
        component: () => import('@/pages/UserLayout.vue'), // 這是側邊欄外殼
        redirect: '/user/profile', // 當使用者輸入 /user 時自動導向
        children: [
            {
                path:'history',
                name:'History',
                component:()=>import('../pages/user/History.vue')
            },
            {
                path: 'profile', // 網址：/user/profile
                name: 'UserProfile',
                component: () => import('../pages/user/ProfileView.vue'),
            },
            {
                path: 'orders', // 網址：/user/orders
                name: 'UserOrders',
                component: () => import('../pages/user/OrdersView.vue')
            },
            {
                path: 'commissions', // 網址：/user/commissions
                name: 'UserShops',
                component: () => import('../pages/user/CommissionsView.vue')
            },
            {
                path: 'shops',
                name: 'Shops',
                component: () => import('../pages/user/ShopView.vue')
            },
            {
                path:'balance',
                name:'UserBalance',
                component:()=>import('../pages/user/CashFlow.vue')
            },
            {
                path:'walletLogs',
                name:'WalletLogs',
                component:()=>import('../pages/user/WalletLogs.vue')
            },
            {
                path:'messageBox',
                name:'MessageBox',
                component:()=>import('../pages/user/MessageBox.vue')
            },
            {
              path:'review',
              name:'Review',
              component:()=>import('../pages/user/Review.vue')
            },
            {
                // 是商品,不想改路由了
                path:'product-review',
                name:'productReview',
                component:()=>import('../pages/user/ProductReview.vue')
            },
            {
                // 是賣場
                path:'store-review',
                name:'StoreReview',
                component:()=>import('../pages/user/StoreReview.vue')
            },
            {
                path:'center-view',
                name:'CenterView',
                component:()=>import('../pages/user/center.vue')
            },
            {
                path:'store-order',
                name:'StoreOrder',
                component:()=>import('../pages/user/StoreOrder.vue')
            },
            {
                path:'buyer-order',
                name:'BuyerOrder',
                component:()=>import('../pages/user/BuyerOrders.vue')
            }

        ]
    },
]
const router = createRouter({
    history:createWebHistory(),
    routes
})
export default router