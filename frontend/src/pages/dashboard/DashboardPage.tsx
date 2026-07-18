import BalanceOverviewCard from "../../widgets/dashboard/BalanceOverviewCard.tsx";
import TopMoversCard from "../../widgets/dashboard/TopMoversCard.tsx";
import MyPortfolioCard from "../../widgets/dashboard/MyPortfolioCard.tsx";
import MonvirexAICard from "../../widgets/dashboard/MonvirexAICard.tsx";

const DashboardPage = () => {
    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
            <div className="mx-auto max-w-[1700px]">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8">
                        <BalanceOverviewCard />
                    </div>

                    <div className="xl:col-span-4">
                        <TopMoversCard />
                    </div>

                    <div className="xl:col-span-8">
                        <MyPortfolioCard />
                    </div>

                    <div className="xl:col-span-4">
                        <MonvirexAICard />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardPage;