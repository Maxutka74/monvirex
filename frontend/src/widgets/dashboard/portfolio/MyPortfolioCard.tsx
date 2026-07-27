import {useEffect, useState} from "react";
import walletApi, {type UserPortfolio} from "../../../features/wallet/api/walletApi.ts";
import assetsApi, {type Asset, type AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import { HiOutlineClock } from "react-icons/hi";
import PortfolioSparkline from "./PortfolioSparkline.tsx";
import {GoArrowDownRight, GoArrowUpRight} from "react-icons/go";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";
import {RiLoaderLine} from "react-icons/ri";


const MyPortfolioCard = () => {
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

                const assets = await assetsApi.getAssets(assetList);

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

    const portfolioTableData = portfolio
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

    const formatPrice = (price: number | string) => {
        const value = Number(price);

        if (value >= 1) {
            return `$${value.toFixed(2)}`;
        }

        if (value >= 0.01) {
            return `$${value.toFixed(4)}`;
        }

        if (value > 0) {
            return `$${value.toFixed(6)}`;
        }

        return "$0.00";
    };

    const totalPages = Math.ceil(
        portfolioTableData.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;

    const paginatedPortfolioData = portfolioTableData.slice(
        startIndex,
        endIndex
    );

    return (
        <div className="relative w-full min-h-[400px] rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-5">
            <div className="flex flex-row items-center gap-2 pb-[20px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#429EFF] sm:h-[44px] sm:w-[44px]">
                    <HiOutlineClock
                        size={24}
                        className="text-[#FFFFFF]"
                    />
                </div>

                <h4 className="text-[20px] font-medium sm:text-[24px]">
                    My Portfolio
                </h4>
            </div>

            {isLoading ? (
                <div className="flex h-[240px] w-full items-center justify-center">
                    <RiLoaderLine
                        size={48}
                        className="animate-spin text-[#666D80]"
                    />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full">
                        <thead>
                        <tr className="h-[31px] w-full font-medium text-[#666D80]">
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
                                    {formatPrice(item.value)}
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
                                    {formatPrice(item.balance)}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        {paginatedPortfolioData.length === 0 && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <p className="text-[18px] sm:text-xl text-gray-600 text-center">You don’t have any cryptocurrencies in your portfolio yet</p>
                            </div>
                        )}
                    </table>
                </div>
            )}

            {currentPage <= totalPages && (
                <div className="flex flex-row items-center justify-center gap-4 pt-2 text-[#666D80]">
                    <FiArrowLeft
                        size={24}
                        onClick={() =>
                            currentPage > 1
                                ? setCurrentPage(currentPage - 1)
                                : null
                        }
                        className={`cursor-pointer ${
                            currentPage === 1
                                ? "pointer-events-none cursor-not-allowed text-[#CBD5E1]"
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
                            currentPage === totalPages
                                ? "pointer-events-none cursor-not-allowed text-[#CBD5E1]"
                                : ""
                        }`}
                    />
                </div>
            )}
        </div>
    );
};

export default MyPortfolioCard;