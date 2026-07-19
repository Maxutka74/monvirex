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

const ProfileDropdown = ({
                             firstName,
                             lastName,
                             email,
                             logoutFunc,
                         }: ProfileDropdownProps) => {
    const [changeTheme, setChangeTheme] = useState(false);

    return (
        <div
            className="
                flex flex-col gap-4
                w-[310px] max-w-[calc(100vw-16px)] xl:w-[250px]
                rounded-[24px] xl:rounded-[20px]
                bg-white
                p-5 xl:p-4
            "
        >
            <div className="flex flex-col justify-center gap-1">
                <h5 className="text-[28px] xl:text-[20px] font-medium leading-tight">
                    {firstName} {lastName}
                </h5>

                <p className="truncate text-[#6F6F6F]">
                    {email}
                </p>
            </div>

            <div className="w-full h-px bg-[#E5E7EB]" />

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 cursor-pointer">
                    <BiUser size={28} />
                    <span>Profile</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex justify-center gap-2">
                        <IoMoonOutline size={28} />
                        <span>Dark Mode</span>
                    </div>

                    <div>
                        {changeTheme ? (
                            <LiaToggleOnSolid
                                size={52}
                                className="text-[#429EFF] cursor-pointer"
                                onClick={() =>
                                    setChangeTheme(!changeTheme)
                                }
                            />
                        ) : (
                            <LiaToggleOffSolid
                                size={52}
                                className="text-[#DFE1E7] cursor-pointer"
                                onClick={() =>
                                    setChangeTheme(!changeTheme)
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-[#E5E7EB]" />

                <button
                    className="flex items-center gap-2 text-[#DF1C41] cursor-pointer"
                    onClick={logoutFunc}
                >
                    <RiLogoutCircleRLine size={28} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;