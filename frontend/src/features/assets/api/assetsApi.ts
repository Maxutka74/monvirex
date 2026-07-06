import api from "../../../shared/api/instance.ts";

export type Asset = {
    symbol: string
    name: string
    icon_url: string
    current_price: string
    price_change_24h: string
    volume_24h: string
}

export type Assets = {
    count: number
    next: string | null
    previous: string | null
    results: Asset[]
}

export type AssetDetail = Asset & {
    'is_active': boolean,
    'created_at': string,
    'updated_at': string,
}

export type TopAsset = {
    top_movers: Asset[]
}

export type AssetKlines = {
    'time': number,
    'open': string,
    'high': string,
    'low': string,
    'close': string,
    'volume': string,
}


const getAssets = async (): Promise<Assets> => {
    const response = await api.get('/crypto/assets/')

    return response.data
}

const getAssetBySymbol = async (symbol: string): Promise<AssetDetail> => {
    const response = await api.get(`/crypto/assets/${symbol}/`)

    return response.data
}

const getTopMovers = async (): Promise<TopAsset> => {
    const response = await api.get('/crypto/assets/top-movers/')

    return response.data
}

const getAssetKlines = async (symbol: string, interval: string, limit: number): Promise<AssetKlines[]> => {
    const response = await api.get(`/crypto/assets/klines/${symbol}/${interval}/${limit}/`)

    return response.data
}

export default {
    getAssets,
    getAssetBySymbol,
    getTopMovers,
    getAssetKlines
}