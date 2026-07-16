import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.tsx";
import VerifyPasswordPage from "./pages/auth/VerifyPasswordPage.tsx";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage.tsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.tsx";
import ProtectedRoute from "./app/router/ProtectedRoute.tsx";
import AuthFlowRoute from "./app/router/AuthFlowRoute.tsx";
import MainLayout from "./app/layouts/MainLayout.tsx";
import DashboardPage from "./pages/dashboard/DashboardPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<AuthPage />} />
                <Route path='/reset-password' element={<ForgotPasswordPage />} />
                <Route element={<AuthFlowRoute storageKey='verify_token' redirectTo='/' />}>
                    <Route path='/verify-email' element={<VerifyEmailPage />} />
                </Route>
                <Route element={<AuthFlowRoute storageKey='reset_token' redirectTo='/reset-password' />}>
                    <Route path='/verify-reset-password' element={<VerifyPasswordPage />} />
                </Route>
                <Route element={<AuthFlowRoute storageKey='reset_verify_token' redirectTo='/reset-password' />}>
                <Route path='/change-password' element={<ChangePasswordPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />} >
                        <Route path='/dashboard' element={<DashboardPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App