import {PiUsersThree} from "react-icons/pi";
import {CgClose} from "react-icons/cg";
import {type SetStateAction, useEffect, useState} from "react";
import adminApi, {type AdminPanelToggleUser} from "../../../features/admin/api/adminApi.ts";
import {MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight} from "react-icons/md";
import {VscSearch} from "react-icons/vsc";
import UserDetailsModal from "./UserDetailsModal.tsx";

type userFormatData = {
    id: string,
    name: string,
    email: string,
    status: string,
    joined: string
}

type TotalUsersModalProps = {
    setUsersModalOpen: React.Dispatch<SetStateAction<boolean>>
    tableFormatingData: userFormatData[]
    banUser: (id: number) => Promise<AdminPanelToggleUser | undefined>
    allPages: number

}

const TotalUsersModal = ({setUsersModalOpen, tableFormatingData, banUser, allPages}: TotalUsersModalProps) => {
    const [totalUserAll, setTotalUserAll] = useState<userFormatData[]>(tableFormatingData);
    const [searchInput, setSearchInput] = useState("");
    const [searchTotal, setSearchTotal] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentUser, setCurrentUser] = useState<number>();
    const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);

    useEffect(() => {
        const timeoutInput = setTimeout(async () => {
            if (!searchInput) {
                setCurrentPage(0)
                setTotalUserAll(tableFormatingData)
                setSearchTotal(null)
                return;
            }

            try {
                const searchUser = await adminApi.getAdminUsers(currentPage + 1, searchInput)

                const formatData = searchUser.results.map((user) => ({
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

                setTotalUserAll(formatData)
                setSearchTotal(searchUser.results.length)
            } catch (e) {
                console.error(e);
            }

        }, 500)

        return () => {
            clearTimeout(timeoutInput)
        }

    }, [searchInput, searchInput && currentPage])

    const paginatedUsers = async (page: number) => {
        try {
            const userData = await adminApi.getAdminUsers(page)

            const formatData = userData.results.map((user) => ({
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

            setTotalUserAll(formatData)
        } catch (error) {
            console.log(error)
        }
    }

    const banUserModal = async (id: number) => {
        const updateUser = await banUser(id)

        setTotalUserAll(totalUserAll =>
            totalUserAll.map((user) =>
                Number(user.id) === Number(id)
                ? {...user, status: updateUser?.is_active ? "Active" : "Inactive"}
                : user))
    }

    const totalPage = Math.ceil((searchTotal ?? allPages) / 5)

    const paginatedPages = totalUserAll

    const pagesToDisplay = () => {
        const page = currentPage + 1

        if (totalPage <= 3) {
            return Array.from({length: totalPage}, (_, i) => i + 1)
        }

        let pageList = []

        pageList.push(1)

        if (page <= 2) {
            pageList.push(2)
            pageList.push(3)
            pageList.push('...')
        } else if (page >= totalPage - 1) {
            pageList.push('...')
            pageList.push(totalPage - 2)
            pageList.push(totalPage - 1)
        } else {
            pageList.push('...')
            pageList.push(page - 1)
            pageList.push(page)
            pageList.push(page + 1)
            pageList.push('...')
        }

        if (totalPage > 1) {
            pageList.push(totalPage)
        }

        return pageList
    }

    const userId = (id: number) => {
        setCurrentUser(id)
        setUserDetailsModalOpen(true);
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5'>
            <div className='max-w-[900px] overflow-y-auto w-full bg-white rounded-[20px] p-4'>
                <div className='flex flex-row justify-between gap-5 mb-5'>
                    <div className='flex flex-row items-center gap-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <PiUsersThree size={22} />
                        </div>
                        <div className='flex flex-col justify-center font-medium'>
                            <h3 className='text-xl sm:text-2xl'>All Users</h3>
                            <p className='text-xs sm:text-sm text-gray-400'>List of user accounts</p>
                        </div>
                    </div>
                    <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#DFE1E7] sm:h-[48px] sm:w-[48px] cursor-pointer shrink-0' onClick={() => setUsersModalOpen(false)}><CgClose size={24}/></button>
                </div>
                <div className='relative max-w-[400px]'>
                    <VscSearch size={20} className='absolute top-3 left-2.5' />
                    <input value={searchInput} className='w-full h-[44px] outline-none border border-gray-200 rounded-lg px-10 py-3 mb-5' type="text" placeholder='Search users by id or email...' onChange={(e) => setSearchInput(e.target.value)}/>
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
                        {paginatedPages.map((user) => (
                            <tr className='h-[60px] border-t border-gray-200 cursor-pointer hover:bg-gray-100' key={user.id} onClick={() => userId(Number(user.id))}>
                                <td className='text-center'>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className='flex justify-center py-5'>
                                    <button className={`w-[60px] text-sm flex justify-center rounded-full ${user.status === 'Active' ?  'text-green-500 bg-green-100': 'text-red-500 bg-red-100'} cursor-pointer`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                banUserModal(Number(user.id))
                                            }}
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
                <div className='flex flex-col md:flex-row items-center justify-between mt-4'>
                    <p className='font-medium mb-3'>Showing page {totalPage === 0 ? currentPage: currentPage+1} of {totalPage}</p>
                    <div className='flex flex-row items-center gap-2'>
                        <button className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 rounded-md cursor-pointer ${currentPage + 1 === 1 && 'pointer-events-none cursor-not-allowed'}`} onClick={() => {
                            if (!searchInput) {paginatedUsers(currentPage)} setCurrentPage(currentPage => currentPage - 1);
                        }}><MdOutlineKeyboardArrowLeft size={23} /></button>

                        <div className='flex sm:hidden w-[36px] h-[36px] justify-center items-center border border-gray-200 bg-[#429EFF] text-white font-medium rounded-md'>
                            {currentPage + 1}
                        </div>

                        <div className='hidden sm:flex flex-row items-center gap-3'>
                            {pagesToDisplay().map((item, index) => (
                                <button key={`${item} - ${index}`} className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 font-medium rounded-md cursor-pointer ${typeof item === 'number' ? currentPage === item - 1 && 'bg-[#429EFF] text-white': 'pointer-events-none cursor-not-allowed'}
                                 `}
                                    onClick={() => {
                                        if (typeof item === 'number') {
                                            setCurrentPage(item - 1)

                                            if (!searchInput) {
                                                paginatedUsers(item)
                                            }
                                    }
                                }}>{item}</button>
                            ))}
                        </div>
                        <button className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 rounded-md cursor-pointer ${(currentPage + 1 === totalPage || totalPage === 0) && 'pointer-events-none cursor-not-allowed'}`} onClick={() => {if (!searchInput) {paginatedUsers(currentPage + 2)} setCurrentPage(currentPage => currentPage + 1)}}><MdOutlineKeyboardArrowRight size={23} /></button>
                    </div>
                </div>
            </div>
            {userDetailsModalOpen && (
                <UserDetailsModal setUserDetailsModalOpen={setUserDetailsModalOpen} id={currentUser} />
            )}
        </div>
    )
}

export default TotalUsersModal