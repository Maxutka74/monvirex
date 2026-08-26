import api from "../../../shared/api/instance.ts";

export type AdminPanelUsers = {
    id: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    date_joined: string
}

export type AdminPanelUsersPaginate = {
    count: number
    next: string | null
    previous: string | null
    results: AdminPanelUsers[]
}

export type AdminPanelUser = AdminPanelUsers & {
    wallet_balance: string
    crypto_holdings_count: number
    total_trades_count: number
}

export type AdminPanelToggleUser = {
    id: string
    email: string
    is_active: boolean
}

export type AdminPanelTransactions = {
    id: string
    user_email: string
    transaction_type: string
    amount: string
    status: string
    created_at: string
}

export type AdminPanelTransactionsPaginate = {
    count: number
    next: string | null
    previous: string | null
    results: AdminPanelTransactions[]
}

export type AdminPanelCryptoTransactions = {
    id: string
    user_email: string
    asset: string
    transaction_type: string
    crypto_amount: string
    usdt_amount: string
    status: string
    created_at: string
}

export type AdminPanelCryptoTransactionsPaginate = {
    count: number
    next: string | null
    previous: string | null
    results: AdminPanelCryptoTransactions[]
}

export type AdminPanelStats = {
    total_users: number
    total_wallet_balance: string
    total_transactions_24h: number
    total_crypto_transaction_24h: number
    total_crypto_value: string
    total_portfolio_value: string
    total_snapshots_count: number
}


const getAdminUsers = async (page?: number, search?: string): Promise<AdminPanelUsersPaginate> => {
    if (page && !search) {
        const response = await api.get(`/admin-panel/users/?page=${page}`)

        return response.data
    }
    if (search) {
        const response = await api.get(`/admin-panel/users/?page=${page}&search=${search}`)

        return response.data
    }
    const response = await api.get('/admin-panel/users/')

    return response.data
}

const getAdminUserById = async (userId: number): Promise<AdminPanelUser> => {
    const response = await api.get(`/admin-panel/users/${userId}/`)

    return response.data
}

const toggleAdminUserActive = async (userId: number): Promise<AdminPanelToggleUser> => {
    const response = await api.patch(`/admin-panel/users/${userId}/toggle-active/`)

    return response.data
}

const getAdminTransactions = async (page?: number, search?: string): Promise<AdminPanelTransactionsPaginate> => {
    if (page && !search) {
        const response = await api.get(`/admin-panel/transactions/?page=${page}`)

        return response.data
    }
    if (search) {
        const response = await api.get(`/admin-panel/transactions/?page=${page}&search=${search}`)

        return response.data
    }

    const response = await api.get('/admin-panel/transactions/')

    return response.data
}

const getAdminCryptoTransactions = async (page?: number, search?: string): Promise<AdminPanelCryptoTransactionsPaginate> => {
    if (page && !search) {
        const response = await api.get(`/admin-panel/crypto-transactions/?page=${page}`)

        return response.data
    }
    if (search) {
        const response = await api.get(`/admin-panel/crypto-transactions/?page=${page}&search=${search}`)

        return response.data
    }

    const response = await api.get('/admin-panel/crypto-transactions/')

    return response.data
}

const syncAssets = async (): Promise<void> => {
    await api.post('/admin-panel/assets/sync/')

}

const getAdminStats = async (): Promise<AdminPanelStats> => {
    const response = await api.get('/admin-panel/stats/')

    return response.data
}

export default {
    getAdminUsers,
    getAdminUserById,
    toggleAdminUserActive,
    getAdminTransactions,
    getAdminCryptoTransactions,
    syncAssets,
    getAdminStats
}