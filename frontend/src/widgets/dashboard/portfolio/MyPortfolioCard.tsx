import {useEffect, useMemo, useState} from "react";
import walletApi, {type UserPortfolio} from "../../../features/wallet/api/walletApi.ts";
import assetsApi, {type Asset, type AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import { HiOutlineClock } from "react-icons/hi";
import PortfolioSparkline from "./PortfolioSparkline.tsx";
import {GoArrowDownRight, GoArrowUpRight} from "react-icons/go";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";
import {RiLoaderLine} from "react-icons/ri";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";
import {formatNumber} from "../../../shared/utils/formatNumber.ts";


const MyPortfolioCard = () => {
    const theme = useStore(themeStore, (state) => state.theme);

    const [portfolio, setPortfolio] = useState<UserPortfolio[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [klinesBySymbol, setKlinesBySymbol] = useState<
        Record<string, AssetKlines[]>
    >({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const itemsPerPage = 5;

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true);

                const assetList: string[] = [];

                const portfolioHistory = await walletApi.getPortfolio();

                const klinesEntries = await Promise.all(
                    portfolioHistory.portfolio.map(async (item) => {
                        assetList.push(item.asset);

                        const klines = await assetsApi.getAssetKlines(
                            item.asset,
                            "4h",
                            60
                        );

                        return [item.asset, klines] as const;
                    })
                );

                const assets = await assetsApi.getAssets(undefined, assetList);

                setPortfolio(portfolioHistory.portfolio);
                setAssets(assets.results);
                setKlinesBySymbol(Object.fromEntries(klinesEntries));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        data();
    }, []);

    const portfolioTableData = useMemo(() => {
        return portfolio
            .map((item) => {
                const asset = assets.find(
                    (asset) => asset.symbol === item.asset
                );

                if (!asset) {
                    return null;
                }

                const balance = Number(item.amount);
                const price = Number(asset.current_price);

                return {
                    icon: asset.icon_url,
                    symbol: asset.symbol,
                    balance: balance * price,
                    graphic: klinesBySymbol[item.asset] ?? [],
                    change_price: asset.price_change_24h,
                    value: price,
                };
            })
            .filter((item) => item !== null);
    }, [portfolio, assets, klinesBySymbol])

    const {totalPages, paginatedPortfolioData} = useMemo(() => {
        const totalPages = Math.ceil(
            portfolioTableData.length / itemsPerPage
        );

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = currentPage * itemsPerPage;

        const paginatedPortfolioData = portfolioTableData.slice(
            startIndex,
            endIndex
        );

        return {
            totalPages,
            paginatedPortfolioData,
        }
    }, [portfolioTableData, currentPage])

    return (
        <div className={`
                relative w-full min-h-[400px] rounded-[30px] p-4 sm:p-5
                ${theme === "dark" ? "border border-[#0B4EA2] bg-black/60 text-white" : "bg-[#FFFFFF]/60 text-black"}
            `}>
            <div className="flex flex-row items-center gap-2 pb-[20px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#429EFF] sm:h-[44px] sm:w-[44px]">
                    <HiOutlineClock
                        size={24}
                        className="text-[#FFFFFF]"
                    />
                </div>

                <h4 className={`
                    text-[20px] font-medium sm:text-[24px]
                    ${theme === "dark" ? "text-white" : "text-black"}
                `}>
                    My Portfolio
                </h4>
            </div>

            {isLoading ? (
                <div className="flex h-[240px] w-full items-center justify-center">
                    <RiLoaderLine
                        size={48}
                        className={`animate-spin ${
                            theme === "dark" ? "text-[#A7B0C3]" : "text-[#666D80]"
                        }`}
                    />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full">
                        <thead>
                        <tr className={`
                                h-[31px] w-full font-medium
                                ${theme === "dark" ? "text-[#A7B0C3]" : "text-[#666D80]"}
                            `}>
                            <th
                                scope="col"
                                className="h-[26px] w-1/5 text-left"
                            >
                                Asset
                            </th>

                            <th
                                scope="col"
                                className="h-[26px] w-1/5 text-left"
                            >
                                Price
                            </th>

                            <th
                                scope="col"
                                className="h-[26px] w-1/5"
                            >
                                7 Days Market
                            </th>

                            <th
                                scope="col"
                                className="h-[26px] w-1/5"
                            >
                                24H Change
                            </th>

                            <th
                                scope="col"
                                className="h-[26px] w-1/5"
                            >
                                Value
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {paginatedPortfolioData.map((item) => (
                            <tr
                                key={item.symbol}
                                className="h-[46px]"
                            >
                                <td>
                                    <div className="flex h-[46px] items-center gap-2 font-medium">
                                        <img
                                            src={item.icon}
                                            alt=""
                                            className="h-[20px] w-[20px]"
                                        />

                                        {item.symbol.slice(0, 3)}
                                    </div>
                                </td>

                                <td className="h-[46px] font-medium">
                                    ${formatNumber(item.value)}
                                </td>

                                <td className="pointer-events-none h-[48px]">
                                    <div className="flex h-full w-full items-center justify-center">
                                        <PortfolioSparkline
                                            data={item.graphic}
                                            isPositive={
                                                Number(item.change_price) >
                                                0
                                            }
                                        />
                                    </div>
                                </td>

                                <td>
                                    <div
                                        className={`flex h-[46px] items-center justify-center ${
                                            Number(item.change_price) > 0
                                                ? "text-[#40C4AA]"
                                                : "text-[#DF1C41]"
                                        }`}
                                    >
                                        {Number(item.change_price) > 0 ? (
                                            <>
                                                <GoArrowUpRight />
                                                +{item.change_price}%
                                            </>
                                        ) : (
                                            <>
                                                <GoArrowDownRight />
                                                {item.change_price}%
                                            </>
                                        )}
                                    </div>
                                </td>

                                <td className="h-[26px] text-center font-medium">
                                    ${formatNumber(item.balance)}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        {paginatedPortfolioData.length === 0 && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <p className={`
                                    text-[18px] text-center sm:text-xl
                                    ${theme === "dark" ? "text-[#A7B0C3]" : "text-gray-600"}
                                `}>
                                    You don’t have any cryptocurrencies in your portfolio yet
                                </p>
                            </div>
                        )}
                    </table>
                </div>
            )}

            {currentPage <= totalPages && (
                <div className={`
                        flex flex-row items-center justify-center gap-4 pt-2
                        ${theme === "dark" ? "text-[#A7B0C3]" : "text-[#666D80]"}
                    `}>
                    <FiArrowLeft
                        size={24}
                        onClick={() =>
                            currentPage > 1
                                ? setCurrentPage(currentPage - 1)
                                : null
                        }
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? `pointer-events-none cursor-not-allowed ${
                                    theme === "dark" ? "text-[#3A4355]" : "text-[#CBD5E1]"
                                }`
                                : ""
                        }`}
                    />

                    <p>
                        Page {currentPage} of {totalPages}
                    </p>

                    <FiArrowRight
                        size={24}
                        onClick={() =>
                            currentPage < totalPages
                                ? setCurrentPage(currentPage + 1)
                                : null
                        }
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? `pointer-events-none cursor-not-allowed ${
                                    theme === "dark" ? "text-[#3A4355]" : "text-[#CBD5E1]"
                                }`
                                : ""
                        }`}
                    />
                </div>
            )}
        </div>
    );
};

export default MyPortfolioCard;