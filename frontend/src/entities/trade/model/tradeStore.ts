import {create} from "zustand";
import type {AssetKlines} from "../../../features/assets/api/assetsApi.ts";

export type CurrentOption = {
    symbol: string;
    value: string;
    label: React.ReactNode;
    interval?: string;
}

type MarketOverviewState = {
    klines: AssetKlines[];
    setKlines: (klines: AssetKlines[]) => void;
    addKline: (kline: AssetKlines) => void;
}

type TradeStore = {
    currentAsset: CurrentOption | null
    setCurrentAsset: (asset: CurrentOption | null) => void
}

export const useTradeStore = create<TradeStore>((set) => ({
    currentAsset: null,

    setCurrentAsset: (asset) =>
        set({currentAsset: asset})
}))

export const useMarketOverviewStore = create<MarketOverviewState>((set) => ({
    klines: [],

    setKlines: (klines) => set({klines}),
    addKline: (kline) =>
        set((state) => ({
            klines: [...state.klines.slice(1), kline]
        }))
}))