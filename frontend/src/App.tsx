import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.tsx";
import VerifyResetPage from "./pages/auth/VerifyResetPage.tsx";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<AuthPage />} />
                <Route path='/reset-password' element={<ForgotPasswordPage />} />
                <Route path='/verify-reset-password' element={<VerifyResetPage />} />
                <Route path='/change-password' element={<ChangePasswordPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App