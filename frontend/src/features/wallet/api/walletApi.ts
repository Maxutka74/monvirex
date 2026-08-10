import api from "../../../shared/api/instance.ts";

export type UserTransaction = {
    id: string
    transaction_type: string
    amount: string
    status: string
    created_at: string
}

export type UserTransactionResponse = {
    transactions: UserTransaction[]
}

export type UserPayment = {
    amount: string | number
    idempotency_key?: string
}

export type UserPortfolio = {
    asset: string
    amount: string
    average_buy_price: string
    current_value: string
    profit_loss: string
}

export type UserCryptoHistoryResponse = {
    portfolio: UserPortfolio[]
}

export type UserSnapshot = {
    created_at: string
    wallet_balance: string
    current_value: string
    total_value: string
}

export type UserSnapshotHistoryResponse  = {
    portfolio_snapshots: UserSnapshot[]
}

export type UserSummary = {
    deposit: string
    withdraw: string
    buy: string
    sell: string
    exchange: string
}

export type UserSummaryHistory = {
    summary: UserSummary
}

export type UserCryptoTransaction = {
    id: string
    from_asset: string
    asset: string
    transaction_type: string
    crypto_amount: string
    usdt_amount: string
    status: string
    created_at: string
}

export type UserCryptoTransactionResponse = {
    transactions: UserCryptoTransaction[]
}



const getBalance = async (): Promise<{ balance: string }> => {
    const response = await api.get('/payment/balance/')
    return response.data
}

const getTransactions = async (): Promise<UserTransactionResponse> => {
    const response = await api.get('/payment/transactions/')
    return response.data
}

const deposit = async (
    data: UserPayment
): Promise<{ transaction_id: string; status: string; amount: string; checkout_url: string }> => {
    const response = await api.post('/payment/deposit/', data)
    return response.data
}

const withdraw = async (
    data: UserPayment
): Promise<{ transaction_id: string; status: string; amount: string; balance_after: string }> => {
    const response = await api.post('/payment/withdraw/', data)
    return response.data
}

const getPortfolio = async (): Promise<UserCryptoHistoryResponse> => {
    const response = await api.get('/payment/portfolio/')
    return response.data
}

const getPortfolioHistory = async (): Promise<UserSnapshotHistoryResponse> => {
    const response = await api.get('/payment/portfolio/history/')
    return response.data
}

const getActivitySummary = async (period: string): Promise<UserSummaryHistory> => {
    const response = await api.get(`/payment/activity-summary/?period=${period}`)
    return response.data
}

const getCryptoTransactions = async (): Promise<UserCryptoTransactionResponse> => {
    const response = await api.get('/payment/crypto_transactions/')
    return response.data
}


export default {
    getBalance,
    getTransactions,
    deposit,
    withdraw,
    getPortfolio,
    getPortfolioHistory,
    getActivitySummary,
    getCryptoTransactions
}