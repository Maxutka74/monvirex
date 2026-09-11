import { NavLink } from "react-router-dom";
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";

type NavItem = {
    label: string;
    path: string;
};

type MobileMenuProps = {
    navItems: NavItem[];
    onClose: () => void;
};

const MobileMenu = ({ navItems, onClose }: MobileMenuProps) => {
    const theme = useStore(themeStore, (state) => state.theme);

    return (
        <div
            className={`
                absolute
                top-[80px]
                left-3
                right-3
                z-20
                overflow-hidden
                rounded-[24px]
                py-3
                shadow-lg
                xl:hidden
                ${
                    theme === 'dark'
                        ? 'bg-[#020817] border border-[#123A70] shadow-[0_0_25px_rgba(21,151,255,0.12)]'
                        : 'bg-white'
                }
            `}
        >
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                        isActive
                            ? `mx-3 mt-1 mb-2 flex items-center justify-between rounded-full px-5 py-4 font-medium text-white ${
                                theme === 'dark'
                                    ? 'bg-[#1597FF] shadow-[0_0_15px_rgba(21,151,255,0.2)]'
                                    : 'bg-[#429EFF]'
                            }`
                            : `flex items-center justify-between border-t border-b px-6 py-5 first:border-t-0 last:border-b-0 ${
                                theme === 'dark'
                                    ? 'border-[#123A70] text-[#A8B8D0] hover:bg-[#071329]'
                                    : 'border-gray-100'
                            }`
                    }
                >
                    {() => (
                        <>
                            <span>{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};

export default MobileMenu;