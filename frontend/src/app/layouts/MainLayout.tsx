import { Outlet } from "react-router-dom";

import Navbar from "../../widgets/navbar/Navbar.tsx";

import bgImage from "../../assets/images/Dashboard.png";

const MainLayout = () => {
    return (
        <div
            className="
                min-h-screen
                bg-cover
                bg-center
                bg-no-repeat
            "
            style={{
                backgroundImage: `url(${bgImage})`,
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