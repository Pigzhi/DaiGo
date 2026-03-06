// src/types/commission.ts

export interface Commission {
    commissionId: number;
    serviceCode: string;
    title: string;
    description?: string;     // ✨ 新增：詳細描述
    price: number;
    quantity: number;
    fee?: number;             // ✨ 新增：平台手續費
    escrowAmount?: number;    // ✨ 新增：預期收入 (實領金額)
    location: string;
    fullAddress?: string;     // ✨ 新增：Google 格式化地址
    latitude?: number | null; // ✨ 新增：經度 (用於 Google Map)
    longitude?: number | null;// ✨ 新增：緯度 (用於 Google Map)
    category: string;
    imageUrl: string | null;
    deadline: string;
    createdAt?: string;       // ✨ 新增：建立時間
    status: string;
    name: string;
    mapUrl?: string|null;
    currency: string;
    reason:string;
    endAt?: string;
    creatorId:string;
}