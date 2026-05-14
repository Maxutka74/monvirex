import useUserStore from "../../../entities/user/model/userStore.ts";
import {useMutation} from "@tanstack/react-query";
import authApi, {
    type ChangeData,
    type LoginData,
    type RegisterData, type TelegramLoginData,
    type VerifyData,
    type VerifyResetData
} from "../api/authApi.ts";
import {useNavigate} from "react-router-dom";


const useRegister = () => {
    return useMutation(
        {
            mutationFn: (data: RegisterData) => authApi.register(data),
            onError: (error) => {
                console.error(error)
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
            },
            onError: (error) => {
                console.error(error)
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
            },
            onError: (error) => {
                console.error(error)
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
            },
            onError: (error) => {
                console.error(error)
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
                localStorage.setItem('reset_token', JSON.stringify({
                    'reset_id': response.reset_id,
                    'email': response.email,
                    'expires_at': response.expires_at
                }))
                navigate('/verify-reset-password')
            },
            onError: (error) => {
                console.error(error)
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
                localStorage.setItem("reset_verify_token", JSON.stringify({
                    'reset_verify_id': response.reset_verify_id
                }))
                localStorage.removeItem('reset_token')
                navigate('/change-password')
            },
            onError: (error) => {
                console.error(error)
            }
        }
    )
}

const useChangePassword = () => {
    return useMutation(
        {
            mutationFn: (data: ChangeData) => authApi.changePassword(data),
            onError: (error) => {
                console.error(error)
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
            },
            onError: (error) => {
                console.error(error)
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
            },
            onError: (error) => {
                console.error(error)
            }
        }
    )

}

export default {
    useRegister,
    useVerifyEmail,
    useLogin,
    useLogout,
    useResetPassword,
    useVerifyResetPassword,
    useChangePassword,
    useGoogleLogin,
    useTelegramLogin,
}