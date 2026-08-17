import WalletOverviewCard from "../../widgets/myassets/wallet-transactions/wallet/WalletOverviewCard.tsx";
import MarketsCard from "../../widgets/myassets/markets/MarketsCard.tsx";
import BestToBuyCard from "../../shared/ui/best-to-buy/BestToBuyCard.tsx";
import AIChart from "../../shared/ui/AIChart.tsx";
import FastActionCard from "../../widgets/myassets/trading/FastActionCard.tsx";


const MyAssetsPage = () => {
    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
            <div className="mx-auto max-w-[1700px]">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 flex flex-col gap-6">
                        <WalletOverviewCard />
                        <MarketsCard />
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-3">
                        <BestToBuyCard />
                        <FastActionCard />
                        <AIChart />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MyAssetsPage;