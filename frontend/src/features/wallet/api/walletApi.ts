import api from "../../../shared/api/instance.ts";

export type UserTransaction = {
    id: string
    transaction_type: string
    amount: string
    status: string
    created_at: string
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

export type UserSnapshot = {
    created_at: string
    wallet_balance: string
    current_value: string
    total_value: string
}

export type UserSummary = {
    deposit: string
    withdraw: string
    buy: string
    sell: string
    exchange: string
}

export type UserCryptoTransaction = {
    id: string
    asset: string
    transaction_type: string
    crypto_amount: string
    usdt_amount: string
    status: string
    created_at: string
}



const getBalance = async (): Promise<{ balance: string }> => {
    const response = await api.get('/payment/balance/')
    return response.data
}

const getTransactions = async (): Promise<UserTransaction[]> => {
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

const getPortfolio = async (): Promise<UserPortfolio[]> => {
    const response = await api.get('/payment/portfolio/')
    return response.data
}

const getPortfolioHistory = async (): Promise<UserSnapshot[]> => {
    const response = await api.get('/payment/portfolio/history/')
    return response.data
}

const getActivitySummary = async (): Promise<UserSummary> => {
    const response = await api.get('/payment/activity-summary/')
    return response.data
}

const getCryptoTransactions = async (): Promise<UserCryptoTransaction[]> => {
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