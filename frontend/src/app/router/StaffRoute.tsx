import useUserStore from "../../entities/user/model/userStore.ts";
import {Navigate, Outlet} from "react-router-dom";


const StaffRoute = () => {
    const isStaff = useUserStore((state) => (state.isStaff))

    if (!isStaff) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default StaffRoute