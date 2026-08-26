import PlatformOverviewCard from "../../widgets/admin-panel/platform-stats/PlatformOverviewCard.tsx";
import TotalUsersCard from "../../widgets/admin-panel/platform-user/TotalUsersCard.tsx";
import TransactionsCard from "../../widgets/admin-panel/platform-transaction/TransactionsCard.tsx";
import CryptoTransactionsCard from "../../widgets/admin-panel/platform-crypto_transaction/CryptoTransactionsCard.tsx";


const AdminPanelPage = () => {
    return (
            <section className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
                <div className="mx-auto max-w-[1800px]">
                    <div className="grid grid-cols-1 xl:grid-cols-14 gap-6">
                        <div className="xl:col-span-6 min-w-0">
                            <PlatformOverviewCard />
                        </div>
                        <div className="xl:col-span-8 min-w-0">
                            <TotalUsersCard />
                        </div>
                        <div className='xl:col-span-6 min-w-0'>
                            <TransactionsCard />
                        </div>
                        <div className='xl:col-span-8 min-w-0'>
                            <CryptoTransactionsCard />
                        </div>
                    </div>
                </div>
            </section>
        )
    }

export default AdminPanelPage;