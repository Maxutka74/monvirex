import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuthFlowRoute from "../router/AuthFlowRoute.tsx";
import ProtectedRoute from "../router/ProtectedRoute.tsx";
import StaffRoute from "../router/StaffRoute.tsx";
import MainLayout from "../layouts/MainLayout.tsx";


const AuthPage = lazy(() => import("../../pages/auth/AuthPage.tsx"));
const ForgotPasswordPage = lazy(() => import("../../pages/auth/ForgotPasswordPage.tsx"));
const VerifyEmailPage = lazy(() => import("../../pages/auth/VerifyEmailPage.tsx"));
const VerifyPasswordPage = lazy(() => import("../../pages/auth/VerifyPasswordPage.tsx"));
const ChangePasswordPage = lazy(() => import("../../pages/auth/ChangePasswordPage.tsx"));

const DashboardPage = lazy(() => import("../../pages/dashboard/DashboardPage.tsx"));
const MyAssetsPage = lazy(() => import("../../pages/myassets/MyAssetsPage.tsx"));
const TradePage = lazy(() => import("../../pages/trade/TradePage.tsx"));
const AdminPanelPage = lazy(() => import("../../pages/admin-panel/AdminPanelPage.tsx"));
const ProfilePage = lazy(() => import("../../pages/profile/ProfilePage.tsx"));
const AiPage = lazy(() => import("../../pages/ai-assistant/AiPage.tsx"));


const RouterProvider = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={<AuthPage />} />

                    <Route
                        path="/reset-password"
                        element={<ForgotPasswordPage />}
                    />

                    <Route
                        element={
                            <AuthFlowRoute
                                storageKey="verify_token"
                                redirectTo="/"
                            />
                        }
                    >
                        <Route
                            path="/verify-email"
                            element={<VerifyEmailPage />}
                        />
                    </Route>

                    <Route
                        element={
                            <AuthFlowRoute
                                storageKey="reset_token"
                                redirectTo="/reset-password"
                            />
                        }
                    >
                        <Route
                            path="/verify-reset-password"
                            element={<VerifyPasswordPage />}
                        />
                    </Route>

                    <Route
                        element={
                            <AuthFlowRoute
                                storageKey="reset_verify_token"
                                redirectTo="/reset-password"
                            />
                        }
                    >
                        <Route
                            path="/change-password"
                            element={<ChangePasswordPage />}
                        />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route
                                path="/dashboard"
                                element={<DashboardPage />}
                            />

                            <Route
                                path="/myassets"
                                element={<MyAssetsPage />}
                            />

                            <Route
                                path="/trade"
                                element={<TradePage />}
                            />

                            <Route element={<StaffRoute />}>
                                <Route
                                    path="/admin-panel"
                                    element={<AdminPanelPage />}
                                />
                            </Route>

                            <Route
                                path="/profile"
                                element={<ProfilePage />}
                            />

                            <Route
                                path="/ai-assistant"
                                element={<AiPage />}
                            />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default RouterProvider;