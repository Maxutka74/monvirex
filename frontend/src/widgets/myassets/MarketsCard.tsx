import {useEffect, useState} from "react";
import assetsApi, {type Asset} from "../../features/assets/api/assetsApi.ts";
import { HiOutlineClock } from "react-icons/hi";
import {GoArrowDownRight, GoArrowUpRight} from "react-icons/go";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";
import {RiLoaderLine} from "react-icons/ri";
import api from "../../shared/api/instance.ts";
import { CgSortAz } from "react-icons/cg";


const MarketsCard = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextAssetsUrl, setNextAssetsUrl] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [slicer, setSlicer] = useState(0);
    const [search, setSearch] = useState("");
    const [debounceSearch, setDebounceSearch] = useState('');
    const [order, setOrder] = useState('-current_price');
    const [isLoading, setIsLoading] = useState(true);

    const sortOptions = [
        {
            label: "Sort",
            value: "",
        },
        {
            label: "Price",
            value: "current_price",
        },
        {
            label: "Change",
            value: "price_change_24h",
        },
        {
            label: "Volume",
            value: "volume_24h",
        },
        {
            label: "Name",
            value: "name",
        }
    ];

    useEffect(() => {
        if (search.trim().length === 0) {
            setCurrentPage(1)
            setSlicer(0)
            setDebounceSearch('')

            const data = async () => {
                try {
                    setIsLoading(true);

                    const asset = await assetsApi.getAssets(undefined, undefined, order);

                    setNextAssetsUrl(asset.next ?? "")
                    setAssets(asset.results);

                    setTotalPages(Math.ceil(asset.count / asset.results.length))
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };

            data();
        }
    }, [search, order]);

    useEffect(() => {
        if (search.length >= 1){
            const timer = setTimeout(() => setDebounceSearch(search), 500)

            return () => {
                clearTimeout(timer)
            }
        }

    }, [search]);

    useEffect(() => {
        if(debounceSearch.length >= 1) {
            const dataSearch = async () => {
                try {
                    const asset = await assetsApi.getAssets(debounceSearch);

                    setAssets(asset.results);
                    setNextAssetsUrl(asset.next ?? "");
                    setCurrentPage(1);
                    setTotalPages(Math.ceil(asset.count / asset.results.length));
                    setSlicer(0)

                } catch (e) {
                    console.error(e);
                }
            }

            dataSearch();
        }

    }, [debounceSearch]);

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

    const formatPrice = (price: number | string) => {
        const value = Number(price);

        if (value >= 1) {
            return `$${value.toFixed(2)}`;
        }

        if (value >= 0.01) {
            return `$${value.toFixed(4)}`;
        }

        if (value > 0) {
            return `$${value.toFixed(8)}`;
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

        return volume.toFixed(2);
    }

    const nextPageAssets = async () => {
        if (nextAssetsUrl && assets.length <= (currentPage * 5)) {
            const next = nextAssetsUrl.indexOf('api/')

            const nextAssets = await api.get(nextAssetsUrl.slice((next)+3))

            setAssets(assets => [...assets, ...nextAssets.data.results]);
            setNextAssetsUrl(nextAssets.data.next)
        }

    }

    const paginatedAssets = portfolioTableData.slice(slicer, slicer + 5)

    const handleSort = (value: string) => {
        if(!value) return;

        setOrder((order) =>
            order === value? `-${value}` :
                order === `-${value}`? value: value
        )
    }

    return (
        <div className="relative w-full min-h-[400px] rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-5">
            <div className="flex flex-row items-center justify-between pb-[20px]">
                <div className='flex flex-row gap-2 items-center'>
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
                <div className='flex flex-col items-end sm:flex-row gap-6'>
                    <input className='w-[80%] sm:w-[240px] h-[46px] outline-none text-[#666D80] border border-[#A4ACB9] p-2 rounded-full' value={search} type="text" onChange={(e) => setSearch(e.target.value)} placeholder='Search by name...'/>
                    <div className='relative w-[120px] sm:w-[115px] h-[46px] border border-[#A4ACB9] rounded-full text-[#6F6F6F] px-2'>
                        <select className='absolute w-full appearance-none bg-transparent top-2'>
                            {sortOptions.map((option) => (
                                <option key={option.value} value={order} onClick={() => handleSort(option.value)}>
                                    {option.value === order.replace("-", "")
                                        ? `${option.label} ${order.startsWith("-") ? "▾" : "▴"}`
                                        : option.label}
                                </option>
                            ))}
                        </select>
                        <CgSortAz size={24} className='absolute top-2.5 right-1 pointer-events-none'/>
                    </div>
                </div>
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
                                className="h-[56px]"
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
            <div className="flex flex-row items-center justify-center gap-4 pt-2 text-[#666D80]">
                <FiArrowLeft
                    size={24}
                    onClick={() => {
                        currentPage > 1
                            ? setCurrentPage(currentPage => currentPage - 1)
                            : null;
                        setSlicer(slicer => slicer-5)
                        }
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
                            ? setCurrentPage(currentPage => currentPage + 1)
                            : null;
                        nextPageAssets();
                        setSlicer(slicer => slicer + 5)
                    }
                    }
                    className={`cursor-pointer ${
                        currentPage === totalPages
                            ? "pointer-events-none cursor-not-allowed text-[#CBD5E1]"
                            : ""
                    }`}
                />
            </div>
        </div>
    );
};

export default MarketsCard;