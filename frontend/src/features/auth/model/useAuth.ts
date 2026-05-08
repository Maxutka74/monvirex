import useUserStore from "../../../entities/user/model/userStore.ts";
import {useMutation} from "@tanstack/react-query";
import authApi, {
    type ChangeData,
    type LoginData,
    type RegisterData, type TelegramLoginData,
    type VerifyData,
    type VerifyResetData
} from "../api/authApi.ts";


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
                if (response.data) {
                    setUser(response.data)
                }
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
                if (response.data) {
                    setUser(response.data)
                }
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
    return useMutation(
        {
            mutationFn: (email: string) => authApi.resetPassword(email),
            onError: (error) => {
                console.error(error)
            }
        }
    )
}

const useVerifyResetPassword =  () => {
    return useMutation(
        {
            mutationFn: (data: VerifyResetData) => authApi.verifyResetPassword(data),
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
                if (response.data) {
                    setUser(response.data)
                }
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
                if (response.data) {
                    setUser(response.data)
                }
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