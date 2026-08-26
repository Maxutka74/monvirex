import { BsArrowRight } from "react-icons/bs";
import {PiUsersThree} from "react-icons/pi";
import adminApi, {type AdminPanelUsers} from "../../../features/admin/api/adminApi.ts";
import {useEffect, useState} from "react";
import TotalUsersModal from "./TotalUsersModal.tsx";


const TotalUsersCard = () => {
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
        <div className="w-full h-full flex flex-col rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-6">
            <div className='flex flex-col sm:flex-row justify-between gap-5 mb-5'>
                <div className='flex flex-row items-center gap-4'>
                    <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                        <PiUsersThree size={22} />
                    </div>
                    <div className='flex flex-col justify-center font-medium'>
                        <h3 className='text-xl sm:text-2xl'>Total Platform Users</h3>
                        <p className='text-xs sm:text-sm text-gray-400'>List of user accounts</p>
                    </div>
                </div>
                <div className='max-w-[165px] flex flex-row items-center gap-2 cursor-pointer border border-gray-300 px-4 py-2 rounded-lg font-medium' onClick={() => setUsersModalOpen(true)}>
                    <span>View all users</span>
                    <BsArrowRight  size={20} />
                </div>
            </div>
            <div className='w-full overflow-x-auto border border-gray-200 rounded-lg'>
                <table className='w-full min-w-[800px]'>
                    <thead>
                        <tr className='h-[60px] bg-gray-300/60'>
                            <th className='px-2'>ID</th>
                            <th className='text-left'>Name</th>
                            <th className='text-left'>Email</th>
                            <th>Status</th>
                            <th className='text-left'>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableFormatingData.map((user) => (
                            <tr className='h-[60px] border-t border-gray-200' key={user.id} >
                                <td className='text-center'>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className='flex justify-center py-5'>
                                    <button className={`w-[60px] text-sm flex justify-center rounded-full ${user.status === 'Active' ?  'text-green-500 bg-green-100': 'text-red-500 bg-red-100'} cursor-pointer`}
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