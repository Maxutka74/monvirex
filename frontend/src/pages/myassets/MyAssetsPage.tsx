import WalletOverviewCard from "../../widgets/myassets/WalletOverviewCard.tsx";
import MarketsCard from "../../widgets/myassets/MarketsCard.tsx";
import BestToBuyChart from "../../widgets/myassets/BestToBuyChart.tsx";
import AIChart from "../../shared/ui/AIChart.tsx";


const MyAssetsPage = () => {
    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
            <div className="mx-auto max-w-[1700px]">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8">
                        <WalletOverviewCard />
                    </div>

                    <div className='xl:col-span-4'>
                        <BestToBuyChart />
                    </div>

                    <div className="xl:col-span-8">
                        <MarketsCard />
                    </div>

                    <div className='xl:col-span-4'>
                        <AIChart />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MyAssetsPage;