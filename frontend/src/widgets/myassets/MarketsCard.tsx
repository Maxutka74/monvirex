import {useEffect, useState} from "react";
import assetsApi, {type Asset} from "../../features/assets/api/assetsApi.ts";
import { HiOutlineClock } from "react-icons/hi";
import {GoArrowDownRight, GoArrowUpRight} from "react-icons/go";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";
import {RiLoaderLine} from "react-icons/ri";
import api from "../../shared/api/instance.ts";


const MarketsCard = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextAssetsUrl, setNextAssetsUrl] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true);

                const asset = await assetsApi.getAssets();

                if (asset.next) {
                    setNextAssetsUrl(asset.next);
                }
                setAssets(asset.results);

                setTotalPages(asset.count / asset.results.length)
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        data();
    }, []);

    const portfolioTableData = assets
        .map((item) => {
            const price = Number(item.current_price);

            return {
                icon: item.icon_url,
                symbol: item.symbol,
                volume: item.volume_24h,
                change_price: item.price_change_24h,
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

    const formatVolume = (volume: number) => {
        if (volume >= 1_000_000_000) {
            return `${(volume / 1_000_000_000).toFixed(2)}B`;
        }

        if (volume >= 1_000_000) {
            return `${(volume / 1_000_000).toFixed(2)}M`;
        }

        if (volume >= 1_000) {
            return `${(volume / 1_000).toFixed(2)}K`;
        }

        return '0.00K'
    }

    const nextPageAssets = async () => {
        if (nextAssetsUrl) {
            const next = nextAssetsUrl.indexOf('api/')

            const nextAssets = await api.get(nextAssetsUrl.slice((next)+3))

            setAssets([...assets, ...nextAssets.data.results]);
            setNextAssetsUrl(nextAssets.data.next)
        }
    }

    const paginatedAssets = portfolioTableData.slice(currentPage, (currentPage * (assets.length / 5)))

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
                    Markets
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
                                Currency
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
                                24H Volume
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
                                Action
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {paginatedAssets.map((item) => (
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
                                    <div className="flex h-full w-full items-center justify-center font-medium">
                                        {formatVolume(Number(item.volume))}
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

                                <td className="text-center">
                                    <button className='w-[57px] h-[42px] text-white font-medium bg-[#429EFF] rounded-full cursor-pointer'>Buy</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
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
                        onClick={() => {
                            currentPage < totalPages
                                ? setCurrentPage(currentPage + 1)
                                : null;
                            nextPageAssets()
                        }
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

export default MarketsCard;