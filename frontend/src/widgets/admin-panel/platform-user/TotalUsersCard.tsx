import { BsArrowRight } from "react-icons/bs";
import {PiUsersThree} from "react-icons/pi";
import adminApi, {type AdminPanelUsers} from "../../../features/admin/api/adminApi.ts";
import {useEffect, useState} from "react";
import TotalUsersModal from "./TotalUsersModal.tsx";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";


const TotalUsersCard = () => {
    const theme = useStore(themeStore, (state) => state.theme);

    const [usersAll, setUsersAll] = useState<AdminPanelUsers[]>([]);
    const [usersModalOpen, setUsersModalOpen] = useState(false);
    const [allPages, setAllPages] = useState(0);

    useEffect(() => {
        const usersData = async () => {
            try {
                const userDataAll = await adminApi.getAdminUsers();

                setUsersAll(userDataAll.results)
                setAllPages(userDataAll.count)
            } catch (e) {
                console.error(e);
            }
        }

        usersData();
    }, [])

    const banUser = async (id: number) => {
        try {
            const updateUser = await adminApi.toggleAdminUserActive(id)

            setUsersAll(usersAll =>
                usersAll.map((user) =>
                    Number(user.id) === Number(id)
                        ? {...user, is_active: updateUser.is_active}
                        : user))

            return updateUser;
        } catch (e) {
            console.error(e);
        }
    }

    const tableFormatingData = usersAll.map((user) => ({
        id: user.id,
        name: (user.first_name + ' '+ user.last_name),
        email: user.email,
        status: user.is_active ? "Active" : "Inactive",
        joined: Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date(user.date_joined))
    }))

    return (
        <div className={`w-full h-full flex flex-col rounded-[30px] p-4 sm:p-6 ${
            theme === 'dark'
                ? 'bg-black/60 border border-[#123A70] text-white shadow-[0_0_25px_rgba(21,151,255,0.08)]'
                : 'bg-[#FFFFFF]/60'
        }`}>
            <div className='flex flex-col sm:flex-row justify-between gap-5 mb-5'>
                <div className='flex flex-row items-center gap-4'>
                    <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                        <PiUsersThree size={22} />
                    </div>
                    <div className='flex flex-col justify-center font-medium'>
                        <h3 className='text-xl sm:text-2xl'>Total Platform Users</h3>
                        <p className={`text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-[#7184A3]' : 'text-gray-400'
                        }`}>
                            List of user accounts
                        </p>
                    </div>
                </div>
                <div className={`max-w-[165px] flex flex-row items-center gap-2 cursor-pointer px-4 py-2 rounded-lg font-medium ${
                    theme === 'dark'
                        ? 'border border-[#164B86] bg-[#071329] text-[#A8B8D0] hover:bg-[#0B2A52] hover:text-white'
                        : 'border border-gray-300'
                }`} onClick={() => setUsersModalOpen(true)}>
                    <span>View all users</span>
                    <BsArrowRight  size={20} />
                </div>
            </div>
            <div className={`w-full overflow-x-auto rounded-lg ${
                theme === 'dark'
                    ? 'border border-[#164B86]'
                    : 'border border-gray-200'
            }`}>
                <table className='w-full min-w-[800px]'>
                    <thead>
                        <tr className={`h-[60px] ${
                            theme === 'dark'
                                ? 'bg-[#0B2A52] text-[#A8B8D0]'
                                : 'bg-gray-300/60'
                        }`}>
                            <th className='px-2'>ID</th>
                            <th className='text-left'>Name</th>
                            <th className='text-left'>Email</th>
                            <th>Status</th>
                            <th className='text-left'>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableFormatingData.map((user) => (
                            <tr className={`h-[60px] border-t ${
                                theme === 'dark'
                                    ? 'border-[#123A70] '
                                    : 'border-gray-200'
                            }`} key={user.id}>
                                <td className='text-center'>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className='flex justify-center py-5'>
                                    <button className={`w-[60px] text-sm flex justify-center rounded-full ${user.status === 'Active'
                                        ? theme === 'dark'
                                            ? 'text-[#40C4AA] bg-[#0B2E28] border border-[#176B59]'
                                            : 'text-green-500 bg-green-100'
                                        : theme === 'dark'
                                            ? 'text-[#DF1C41] bg-[#2A0D18] border border-[#7A1F35]'
                                            : 'text-red-500 bg-red-100'
                                    } cursor-pointer`}
                                        onClick={() => banUser(Number(user.id))}
                                    >
                                        {user.status}
                                    </button>
                                </td>
                                <td>{user.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {usersModalOpen && (
                <TotalUsersModal setUsersModalOpen={setUsersModalOpen} tableFormatingData={tableFormatingData} banUser={banUser} allPages={allPages}/>
            )}
        </div>
    )
}

export default TotalUsersCard