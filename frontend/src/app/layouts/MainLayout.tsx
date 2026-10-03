import { Outlet } from "react-router-dom";

import Navbar from "../../widgets/navbar/Navbar.tsx";

import bgWhiteImage from "../../assets/images/Dashboard.webp";
import bgBlackImage from "../../assets/images/BlackBackground.webp";
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";


const MainLayout = () => {
    const theme = useStore(themeStore, (state) => state.theme);

    return (
        <div
            className="
                min-h-screen
                bg-cover
                bg-center
                bg-no-repeat
            "
            style={{
                backgroundImage: theme === 'dark' ? `url(${bgBlackImage})`: `url(${bgWhiteImage})`,
            }}
        >
            <Navbar />

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;