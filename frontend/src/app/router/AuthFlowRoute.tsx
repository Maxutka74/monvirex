import {Navigate, Outlet} from "react-router-dom";

type AuthFlowRouteProps = {
    storageKey: string;
    redirectTo: string;

}

const AuthFlowRoute = ({storageKey, redirectTo}: AuthFlowRouteProps) => {

    if (!sessionStorage.getItem(storageKey)) {
        return <Navigate to={redirectTo} replace />
    } else {
        return <Outlet />
    }

}

export default AuthFlowRoute