
export interface DiscountDetails {
    id?: number
    code: string
    percent: number
    amount: string
    usage: number
    limit: number
    expires_in: Date
    productId: number
    type: string
}