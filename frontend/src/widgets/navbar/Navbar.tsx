import {NavLink, useNavigate} from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp, IoMdNotificationsOutline } from "react-icons/io";

import logo from "../../assets/MonvirexLogo.png";
import {useEffect, useState} from "react";
import ProfileDropdown from "./ProfileDropdown.tsx";
import authApi from "../../features/auth/api/authApi.ts";
import profileApi, {type Profile} from "../../features/user/api/profileApi.ts";
import useUserStore, {type UserStore} from "../../entities/user/model/userStore.ts";
import notificationsApi from "../../features/notifications/api/notificationsApi.ts";
import NotificationDropdown from "./NotificationDropdown.tsx";

const Navbar = () => {
    const navItems = [
        { label: "Home", path: "/dashboard" },
        { label: "My Assets", path: "/myassets" },
        { label: "Trade", path: "/trade" },
        { label: "Market", path: "/market" },
        { label: "Admin Panel", path: "/admin-panel" },
    ];

    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<Profile|null>(null)
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);

    const email = useUserStore((state: UserStore | null) => state?.user?.email)

    const logoutFunc = async () => {
        try {
            await authApi.logout();
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const navbarData = async () => {
            if(!email) return;

            try {
                const data = await profileApi.getProfile()
                const unReadNotificationData = await notificationsApi.getUnreadCount()

                setProfileData(data[email])
                setUnreadNotifications(unReadNotificationData.unread_count)
            } catch (error) {
                console.error(error);
            }
        }

        navbarData();
    }, [email])

    return (
        <header className="w-full h-[96px] flex items-center justify-between px-8 bg-transparent overflow-visible">
            <div className="flex items-center gap-3">
                <img
                    className="w-[76px] h-[76px] object-contain"
                    src={logo}
                    alt="Monvirex Logo"
                />

                <h1 className="text-[36px] font-medium">
                    MONVIREX
                </h1>
            </div>

            <nav className="h-[54px] flex items-center gap-2">
                {navItems.map((navItem) => (
                    <NavLink
                        key={navItem.path}
                        to={navItem.path}
                        className={({ isActive }) =>
                            `h-[44px] px-5 flex justify-center items-center rounded-full font-medium ${
                            isActive
                            ? "bg-white text-[#429EFF]"
                            : "text-black hover:text-[#429EFF]"
                        }`
                        }
                    >
                        {navItem.label}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center gap-3">
                <button className="w-[100px] h-[44px] text-white bg-[#429EFF] rounded-full">
                    Buy & Sell
                </button>

                <button className="relative w-[50px] h-[50px] flex justify-center items-center rounded-full cursor-pointer" onClick={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}>
                    <span className="absolute -top-1 -right-1 w-[20px] h-[20px] flex justify-center items-center text-[12px] text-white bg-[#DF1C41] rounded-full">
                        {unreadNotifications}
                    </span>

                    <IoMdNotificationsOutline size={30} />
                </button>

                <button className="flex items-center gap-1 cursor-pointer" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                    <img
                        src={profileData?.avatar}
                        alt=""
                        className="w-[42px] h-[42px] rounded-full object-cover"
                    />
                    {isProfileDropdownOpen ? (
                        <IoIosArrowDown className="size-[18px]" />
                        ):
                        <IoIosArrowUp className="size-[18px]" />
                    }

                </button>
                {isProfileDropdownOpen && (<div className='absolute top-21 right-1'>
                    <ProfileDropdown firstName={profileData?.first_name || ''} lastName={profileData?.last_name || ''} email={email || ''} logoutFunc={logoutFunc} />
                </div>)}
                {isNotificationsDropdownOpen && (<div className='absolute top-21 right-1'>
                    <NotificationDropdown unreadNotifications={unreadNotifications} setUnreadNotifications={setUnreadNotifications} />
                </div>)}
            </div>
        </header>
    );
};

export default Navbar;