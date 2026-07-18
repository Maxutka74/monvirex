import { NavLink } from "react-router-dom";

type NavItem = {
    label: string;
    path: string;
};

type MobileMenuProps = {
    navItems: NavItem[];
    onClose: () => void;
};

const MobileMenu = ({ navItems, onClose }: MobileMenuProps) => {
    return (
        <div
            className="
                absolute
                top-[80px]
                left-3
                right-3
                z-20
                overflow-hidden
                rounded-[24px]
                bg-white
                py-3
                shadow-lg
                xl:hidden
            "
        >
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                        isActive
                            ? "mx-3 mb-2 flex items-center justify-between rounded-full bg-[#429EFF] px-5 py-4 font-medium text-white"
                            : "flex items-center justify-between border-b border-gray-100 px-6 py-5 last:border-b-0"
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span>{item.label}</span>

                            {isActive && (
                                <span className="text-xl font-medium">
                                    →
                                </span>
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};

export default MobileMenu;