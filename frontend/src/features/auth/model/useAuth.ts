import useUserStore from "../../../entities/user/model/userStore.ts";
import {useMutation} from "@tanstack/react-query";
import authApi, {
    type ChangeData,
    type LoginData,
    type RegisterData,
    type TelegramLoginData,
    type VerifyData,
    type VerifyResetData
} from "../api/authApi.ts";
import {useNavigate} from "react-router-dom";


const useRegister = () => {
    const navigate = useNavigate();

    return useMutation(
        {
            mutationFn: (data: RegisterData) => authApi.register(data),
            onSuccess: (response) => {
                sessionStorage.setItem("verify_token", JSON.stringify({
                    'reg_id': response.reg_id,
                    'email': response.email,
                    'expires_at': response.expires_at
                }))
                navigate("/verify-email")
            }
        }
    )
}

const useResendRegister = () => {

    return useMutation(
        {
            mutationFn: (reg_id: string)=> authApi.resendRegister(reg_id),
            onSuccess: (response) => {
                sessionStorage.setItem("verify_token", JSON.stringify({
                    'reg_id': response.reg_id,
                    'email': response.email,
                    'expires_at': response.expires_at
                }))
            }
        }
    )
}

const useVerifyEmail = () => {
    const setUser = useUserStore(state => state.setUser)

    return useMutation(
        {
            mutationFn: (data: VerifyData)=> authApi.verifyEmail(data),
            onSuccess: (response) => {
                setUser(response)
                sessionStorage.removeItem("verify_token")
            }
        }
    )
}

const useLogin = () => {
    const setUser = useUserStore(state => state.setUser)

    return useMutation(
        {
            mutationFn: (data: LoginData) => authApi.login(data),
            onSuccess: (response) => {
                setUser(response)
            }
        }
    )
}

const useLogout = () => {
    const clearUser = useUserStore(state => state.clearUser)

    return useMutation(
        {
            mutationFn: () => authApi.logout(),
            onSuccess: () => {
                clearUser()
            }
        }
    )
}

const useResetPassword = () => {
    const navigate = useNavigate();

    return useMutation(
        {
            mutationFn: (email: string) => authApi.resetPassword(email),
            onSuccess: (response) => {
                sessionStorage.setItem('reset_token', JSON.stringify({
                    'reset_id': response.reset_id,
                    'email': response.email,
                    'expires_at': response.expires_at
                }))
                navigate('/verify-reset-password')
            }
        }
    )
}

const useResendPassword = () => {

    return useMutation(
        {
            mutationFn: (reset_id: string) => authApi.resendPassword(reset_id),
            onSuccess: (response) => {
                sessionStorage.setItem('reset_token', JSON.stringify({
                    'reset_id': response.reset_id,
                    'email': response.email,
                    'expires_at': response.expires_at
                }))
            }
        }
    )
}

const useVerifyResetPassword =  () => {
    const navigate = useNavigate();

    return useMutation(
        {
            mutationFn: (data: VerifyResetData) => authApi.verifyResetPassword(data),
            onSuccess: (response) => {
                sessionStorage.setItem("reset_verify_token", JSON.stringify({
                    'reset_verify_id': response.reset_verify_id
                }))
                sessionStorage.removeItem('reset_token')
                navigate('/change-password')
            }
        }
    )
}

const useChangePassword = () => {
    return useMutation(
        {
            mutationFn: (data: ChangeData) => authApi.changePassword(data),
            onSuccess: () => {
              sessionStorage.removeItem('reset_verify_token')
            }
        }
    )
}

const useGoogleLogin = () => {
    const setUser = useUserStore(state => state.setUser)

    return useMutation(
        {
            mutationFn: (token: string) => authApi.googleLogin(token),
            onSuccess: (response) => {
                setUser(response)
            }
        }
    )
}

const useTelegramLogin = () => {
    const setUser = useUserStore(state => state.setUser)

    return useMutation(
        {
            mutationFn: (data: TelegramLoginData) => authApi.telegramLogin(data),
            onSuccess: (response) => {
                setUser(response)
            }
        }
    )

}

export default {
    useRegister,
    useResendRegister,
    useVerifyEmail,
    useLogin,
    useLogout,
    useResetPassword,
    useResendPassword,
    useVerifyResetPassword,
    useChangePassword,
    useGoogleLogin,
    useTelegramLogin,
}