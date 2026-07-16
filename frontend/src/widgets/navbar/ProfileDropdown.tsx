import {BiUser} from "react-icons/bi";
import { IoMoonOutline } from "react-icons/io5";
import { LiaToggleOffSolid, LiaToggleOnSolid } from "react-icons/lia";
import { RiLogoutCircleRLine } from "react-icons/ri";
import {useState} from "react";

type ProfileDropdownProps = {
    firstName: string;
    lastName: string;
    email: string;
    logoutFunc: () => void | Promise<void>
}

const ProfileDropdown = ({firstName, lastName, email, logoutFunc}: ProfileDropdownProps) => {
    const [changeTheme, setChangeTheme] = useState(false)

    return (
        <div className='w-[250px] flex flex-col gap-3 bg-white rounded-[20px] p-4'>
            <div className='flex flex-col justify-center gap-1'>
                <h5 className='text-[20px] font-medium'>{firstName} {lastName}</h5>
                <p className='text-[#6F6F6F]'>{email}</p>
            </div>
            <div className='w-full h-px bg-[#E5E7EB]'/>
            <div className='flex flex-col justify-center gap-5'>
                <div className='flex flex-row items-center gap-2 cursor-pointer'>
                    <BiUser size={24} />
                    <span>Profile</span>
                </div>
                <div className='flex flex-row justify-between items-center'>
                    <div className='flex flex-row justify-center gap-2'>
                    <IoMoonOutline size={24} />
                    <span>Dark Mode</span>
                    </div>
                    <div>
                        {changeTheme ? (
                            <LiaToggleOnSolid className='text-[#429EFF] cursor-pointer' size={44} onClick={() => setChangeTheme(!changeTheme)} />
                        ):
                            <LiaToggleOffSolid className='text-[#DFE1E7] cursor-pointer' size={44} onClick={() => setChangeTheme(!changeTheme)} />
                        }
                    </div>
                </div>
                <div className='w-full h-px bg-[#E5E7EB]'/>
                <button className='flex flex-row items-center gap-2 text-[#DF1C41] cursor-pointer' onClick={logoutFunc}>
                    <RiLogoutCircleRLine size={24} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default ProfileDropdown