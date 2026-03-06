import { defineStore } from 'pinia';
import { ref } from "vue";
import axios from 'axios';

// 定義商品介面 (根據你的後端回傳格式)
interface Product {
    id: number;
    title?: string;      // 搜尋 API 回傳的是 Title
    name?: string;       // 精選 API 回傳的是 Name (視後端統一情況而定)
    price: number;
    image: string | null;
    location: string;
    category: string;
    deadline?: string;
    description?: string;
}

export const useProductStore = defineStore('product', () => {
    // --- State (狀態) ---
    const products = ref<Product[]>([]);        // 搜尋頁面的商品列表
    const featuredProducts = ref<Product[]>([]); // 首頁的精選商品
    const currentProduct = ref<Product | null>(null); // 單一商品詳情
    const loading = ref(false);

    // --- Actions (動作) ---

    // 1. 搜尋商品 (對接 FilterController)
    // 參數 params 包含: keyword, location, minPrice, maxPrice, sort
    const fetchProducts = async (params: any) => {
        loading.value = true;
        try {
            // 呼叫 FilterController 的 Search API
            const response = await axios.get('http://127.0.0.1:5275/api/Filter/search', {
                params: params
            });

            if (response.data.success) {
                // 注意：你的 Filter API 回傳的欄位是 Title, ImageUrl
                // 這裡做一個簡單的 map 轉換，讓前端統一用 name, image
                products.value = response.data.data.map((item: any) => ({
                    id: item.serviceCode || item.id, // 如果是委託用 serviceCode, 商品用 id (看後端怎麼給)
                    name: item.title,
                    price: item.price,
                    image: item.imageUrl,
                    location: item.location,
                    category: item.category,
                    deadline: item.deadline,
                    description: item.description
                }));
            }
        } catch (error) {
            console.error('搜尋商品失敗:', error);
            products.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 2. 取得首頁精選商品 (對接 DemoShopApiController)
    const fetchFeaturedProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5275/api/createstore/featured-products');
            featuredProducts.value = response.data;
            return response.data;
        } catch (error) {
            console.error('取得精選商品失敗:', error);
            return [];
        }
    };

    // 3. 取得單一商品詳情
    const fetchProductDetail = async (id: number) => {
        loading.value = true;
        try {
            const response = await axios.get(`http://127.0.0.1:5275/api/createstore/products/${id}`);
            currentProduct.value = response.data;
            return response.data;
        } catch (error) {
            console.error('取得商品詳情失敗:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    return {
        // State
        products,
        featuredProducts,
        currentProduct,
        loading,
        // Actions
        fetchProducts,
        fetchFeaturedProducts,
        fetchProductDetail
    };
});