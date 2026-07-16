import BalanceOverviewCard from "../../widgets/dashboard/BalanceOverviewCard.tsx";
import TopMoversCard from "../../widgets/dashboard/TopMoversCard.tsx";
import MyPortfolioCard from "../../widgets/dashboard/MyPortfolioCard.tsx";
import MonvirexAICard from "../../widgets/dashboard/MonvirexAICard.tsx";


const DashboardPage = () => {
    return (
        <section className='flex flex-col gap-5 px-8'>
            <div className='flex flex-row gap-10'>
                <BalanceOverviewCard />
                <TopMoversCard />
            </div>
            <div className='flex flex-row gap-10'>
            <MyPortfolioCard />
            <MonvirexAICard />
            </div>
        </section>
    )
}

export default DashboardPage