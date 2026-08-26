import useUserStore from "../../entities/user/model/userStore.ts";
import {Navigate, Outlet} from "react-router-dom";
import {useEffect} from "react";


const ProtectedRoute = () => {
    const isAuth = useUserStore((state) => (state.isAuth))
    const isLoading = useUserStore((state) => (state.isLoading))
    const checkAuth = useUserStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (!isAuth) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute