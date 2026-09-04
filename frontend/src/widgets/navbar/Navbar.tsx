import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import {
    IoIosArrowDown,
    IoIosArrowUp,
    IoMdNotificationsOutline,
} from "react-icons/io";

import logo from "../../assets/logos/MonvirexLogo.png";

import authApi from "../../features/auth/api/authApi.ts";
import notificationsApi from "../../features/notifications/api/notificationsApi.ts";

import useUserStore, {
    type UserStore,
} from "../../entities/user/model/userStore.ts";

import MobileMenu from "./MobileMenu.tsx";
import NotificationDropdown from "./notification/NotificationDropdown.tsx";
import ProfileDropdown from "./profile/ProfileDropdown.tsx";
import profileStore from "../../entities/profile/profileStore.tsx";

const Navbar = () => {
    const API_URL = 'http://localhost:8000'

    const navItems = [
        { label: "Home", path: "/dashboard" },
        { label: "My Assets", path: "/myassets" },
        { label: "Trade", path: "/trade" },
    ];

    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] =
        useState(false);

    const email = useUserStore(
        (state: UserStore | null) => state?.user?.email
    );

    const profile = profileStore((state) => state.profile)

    const refreshProfile = profileStore((state) => state.refreshProfile)

    const isStaff = useUserStore((state) => state.isStaff)

    if (isStaff) {
        navItems.push({ label: "Admin Panel", path: "/admin-panel" },)
    }

    const logoutFunc = async () => {
        try {
            await authApi.logout();
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!email) return

        refreshProfile(email)
    }, [email]);

    useEffect(() => {
        const navbarData = async () => {
            if (!email) return;

            try {
                const unReadNotificationData =
                    await notificationsApi.getUnreadCount();

                setUnreadNotifications(unReadNotificationData.unread_count);
            } catch (error) {
                console.error(error);
            }
        };

        navbarData();
    }, [email]);

    const avatar = profile?.avatar

    const avatarSrc = avatar
        ? avatar.startsWith('http')
            ? avatar
            : `${API_URL}${avatar}`
        : undefined

    return (
        <header className="relative flex h-[80px] w-full items-center justify-between overflow-visible bg-transparent px-4 md:px-6 xl:h-[96px] xl:px-8">
            <div className="flex items-center gap-3">
                <button
                    className="xl:hidden"
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen);
                        setIsProfileDropdownOpen(false);
                        setIsNotificationsDropdownOpen(false);
                    }}
                >
                    {isMenuOpen ? (
                        <HiOutlineX size={34} />
                    ) : (
                        <HiOutlineMenuAlt3 size={34} />
                    )}
                </button>

                <img
                    className="h-[58px] w-[58px] object-contain xl:h-[76px] xl:w-[76px]"
                    src={logo}
                    alt="Monvirex Logo"
                />

                <h1 className="hidden text-[36px] font-medium xl:block">
                    MONVIREX
                </h1>
            </div>

            <nav className="hidden h-[54px] items-center gap-2 xl:flex">
                {navItems.map((navItem) => (
                    <NavLink
                        key={navItem.path}
                        to={navItem.path}
                        className={({ isActive }) =>
                            `h-[44px] px-5 flex items-center justify-center rounded-full font-medium transition-colors ${
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

            <div className="flex items-center gap-4 xl:gap-3">
                <button className="flex h-[42px] items-center justify-center whitespace-nowrap rounded-full bg-[#429EFF] px-4 text-[15px] text-white cursor-pointer xl:h-[44px] xl:w-[100px] xl:px-5">
                    Buy & Sell
                </button>

                <button
                    className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white shadow cursor-pointer xl:bg-transparent"
                    onClick={() => {
                        setIsNotificationsDropdownOpen(
                            !isNotificationsDropdownOpen
                        );
                        setIsMenuOpen(false);
                        setIsProfileDropdownOpen(false);
                    }}
                >
                    <span className="absolute -top-1 -right-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#DF1C41] text-[12px] text-white">
                        {unreadNotifications}
                    </span>

                    <IoMdNotificationsOutline size={30} />
                </button>

                <button
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                        setIsMenuOpen(false);
                        setIsNotificationsDropdownOpen(false);
                    }}
                >
                    <img
                        src={avatarSrc}
                        alt=""
                        className="
                            w-[40px]
                            h-[40px]
                            xl:w-[42px]
                            xl:h-[42px]
                            rounded-full
                        "
                    />

                    <div className="hidden xl:block">
                        {isProfileDropdownOpen ? (
                            <IoIosArrowDown className="size-[18px]" />
                        ) : (
                            <IoIosArrowUp className="size-[18px]" />
                        )}
                    </div>
                </button>

                {isProfileDropdownOpen && (
                    <div
                        className="
                            absolute
                            top-[72px]
                            right-2
                            z-10
                            w-[310px]
                            max-w-[calc(100vw-16px)]
                            xl:top-21
                            xl:right-1
                        "
                    >
                        <ProfileDropdown
                            firstName={profile?.first_name || ""}
                            lastName={profile?.last_name || ""}
                            email={email || ""}
                            logoutFunc={logoutFunc}
                            setIsProfileDropdownOpen={setIsProfileDropdownOpen}
                        />
                    </div>
                )}

                {isNotificationsDropdownOpen && (
                    <div
                        className="
                            absolute
                            top-[72px]
                            right-2
                            z-10
                            w-[95vw]
                            max-w-[500px]
                            xl:top-21
                            xl:right-1
                            xl:w-auto
                        "
                    >
                        <NotificationDropdown
                            unreadNotifications={unreadNotifications}
                            setUnreadNotifications={setUnreadNotifications}
                        />
                    </div>
                )}
            </div>

            {isMenuOpen && (
                <MobileMenu
                    navItems={navItems}
                    onClose={() => setIsMenuOpen(false)}
                />
            )}
        </header>
    );
};

export default Navbar;