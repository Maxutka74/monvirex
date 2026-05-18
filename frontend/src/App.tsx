import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.tsx";
import VerifyPasswordPage from "./pages/auth/VerifyPasswordPage.tsx";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage.tsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<AuthPage />} />
                <Route path='/verify-email' element={<VerifyEmailPage />} />
                <Route path='/reset-password' element={<ForgotPasswordPage />} />
                <Route path='/verify-reset-password' element={<VerifyPasswordPage />} />
                <Route path='/change-password' element={<ChangePasswordPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App