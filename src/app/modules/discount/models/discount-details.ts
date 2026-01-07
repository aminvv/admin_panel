
export interface DiscountDetails {
    id?: number
    code: string
    percent: number
    amount: string
    limit: number
    expires_in: Date
    productId: number
    type: string
}