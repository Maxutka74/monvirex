import { useEffect, useState } from "react";
import { IoStatsChartSharp } from "react-icons/io5";
import { RiLoaderLine } from "react-icons/ri";

import assetsApi, {
    type Asset,
} from "../../../features/assets/api/assetsApi.ts";

const TopMoversCard = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true);

                const topMoversAssets = await assetsApi.getTopMovers();

                setAssets(topMoversAssets.top_movers.slice(0, 5));
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        data();
    }, []);

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

    return (
        <div
            className="
                w-full
                h-full
                min-h-[400px]
                xl:min-h-[500px]
                flex
                flex-col
                gap-5
                rounded-[30px]
                bg-[#FFFFFF]/60
                p-4
                lg:p-6
            "
        >
            <div className="flex items-center gap-2">
                <div
                    className="
                        flex
                        h-[44px]
                        w-[44px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[#429EFF]
                    "
                >
                    <IoStatsChartSharp
                        size={24}
                        className="text-white"
                    />
                </div>

                <h4 className="text-[18px] font-medium">
                    Top Movers
                </h4>
            </div>

            <div className="flex flex-1 flex-col">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <RiLoaderLine
                            size={36}
                            className="animate-spin text-[#666D80]"
                        />
                    </div>
                ) : (
                    <ul className="flex flex-1 flex-col justify-between gap-2">
                        {assets.map((asset) => (
                            <li key={asset.symbol}>
                                <div
                                    className="
                                        grid
                                        grid-cols-[50px_minmax(0,1fr)_70px_80px]
                                        items-center
                                        gap-2
                                        sm:gap-3
                                        lg:grid-cols-[60px_minmax(0,1fr)_80px_100px]
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            h-[50px]
                                            w-[50px]
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#DFE1E7]
                                            sm:h-[60px]
                                            sm:w-[60px]
                                        "
                                    >
                                        <img
                                            className="
                                                h-[24px]
                                                w-[24px]
                                                sm:h-[30px]
                                                sm:w-[30px]
                                            "
                                            src={asset.icon_url}
                                            alt={asset.name}
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-col items-start justify-center">
                                        <h5
                                            className="
                                                w-full
                                                truncate
                                                text-[16px]
                                                font-medium
                                                sm:text-[20px]
                                            "
                                        >
                                            {asset.symbol}
                                        </h5>

                                        <p
                                            className="
                                                w-full
                                                truncate
                                                text-[12px]
                                                text-[#818898]
                                            "
                                        >
                                            {asset.name.toUpperCase()}
                                        </p>
                                    </div>

                                    <p
                                        className={`text-center ${
                                            Number(asset.price_change_24h) > 0
                                                ? "text-green-400"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {Number(asset.price_change_24h) > 0
                                            ? `+${asset.price_change_24h}%`
                                            : `${asset.price_change_24h}%`}
                                    </p>

                                    <p
                                        className="
                                            text-right
                                            text-[16px]
                                            sm:text-[20px]
                                        "
                                    >
                                        {formatPrice(asset.current_price)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TopMoversCard;