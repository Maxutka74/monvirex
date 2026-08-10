import api from "../../../shared/api/instance.ts";

export type TradeBuyData = {
    symbol: string,
    amount_usdt: string | number,
}

export type TradeSellData = {
    symbol: string,
    amount_crypto: string | number,
}

export type TradeExchangeData = {
    from_asset: string,
    to_asset: string,
    amount_crypto: string | number,
}

export type TradeResponseData = {
    transaction_id: string,
    asset: string,
    crypto_amount: string,
    usdt_amount: string,
    price_at_trade: string,
    balance_after: string,
    holdings: {
        amount: string,
        average_buy_price: string,
    },
    status: string,
}

export type TradeResponseBuy = {
    buy: TradeResponseData
}

export type TradeResponseSell = {
    sell: TradeResponseData
}

export type TradeResponseExchange = {
    exchange: {
        transaction_id: string,
        from_asset: string,
        to_asset: string,
        amount_from: string,
        amount_to: string,
        usdt_equivalent: string,
        from_holding: {
            amount: string,
            average_buy_price: string,
        },
        to_holding: {
            amount: string,
            average_buy_price: string,
        },
        status: string,
    }
}

const buyAsset = async (data: TradeBuyData): Promise<TradeResponseBuy> => {
    const response = await api.post('/trade/buy/', data)

    return response.data
}

const sellAsset = async (data: TradeSellData): Promise<TradeResponseSell> => {
    const response = await api.post('/trade/sell/', data)

    return response.data
}

const exchangeAsset = async (data: TradeExchangeData): Promise<TradeResponseExchange> => {
    const response = await api.post('/trade/exchange/', data)

    return response.data
}

export default {
    buyAsset,
    sellAsset,
    exchangeAsset
}