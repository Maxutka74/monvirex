import TradePerformanceCard from "../../widgets/trade/trading-perfomance/TradePerformanceCard.tsx";
import MarketOverviewCard from "../../widgets/trade/market-overview/MarketOverviewCard.tsx";
import BestToBuyCard from "../../shared/ui/best-to-buy/BestToBuyCard.tsx";
import AIChart from "../../shared/ui/AIChart.tsx";


const TradePage = () => {

        return (
            <section className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
                <div className="mx-auto max-w-[1700px]">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8 min-w-0">
                            <TradePerformanceCard />
                        </div>
                        <div className="xl:col-span-4 min-w-0">
                            <MarketOverviewCard />
                        </div>
                        <div className="xl:col-span-8 min-w-0">
                            <BestToBuyCard trade={true} />
                        </div>
                        <div className="xl:col-span-4 min-w-0">
                            <AIChart />
                        </div>
                    </div>
                </div>
            </section>
        )
}

export default TradePage