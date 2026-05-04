import api from '../../../shared/api/instance.ts'
import type {ApiResponse} from "../../../shared/types";
import type {User} from "../../../entities/user/types/user.ts";

export type RegisterData = {
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    password_confirm: string,
}

export type VerifyData = {
    reg_id: string,
    code: string
}

export type LoginData = {
    email: string,
    password: string
}

export type VerifyResetData = {
    reset_id: string,
    code: string
}

export type ChangeData = {
    reset_verify_id: string,
    password: string,
    password_confirm: string
}


const register = async (data: RegisterData): Promise<ApiResponse<{reg_id: string}>> => {
    const response = await api.post('/auth/register/', data)

    return response.data
}


const verifyEmail = async (data: VerifyData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/verify-email/', data)

    return response.data
}

const login = async (data: LoginData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/login/', data)

    return response.data
}

const logout = async (): Promise<void> => {
    await api.post('/auth/logout/')

}

const resetPassword = async (email: string): Promise<ApiResponse<{reset_id: string}>> => {
    const response = await api.post('/auth/reset-password/', { email })

    return response.data
}

const verifyResetPassword = async (data: VerifyResetData): Promise<ApiResponse<{reset_verify_id: string }>> => {
    const response = await api.post('/auth/verify-reset-password/', data)

    return response.data
}

const changePassword = async (data: ChangeData): Promise<void> => {
    await api.post('/auth/change-password/', data)

}

export default {
    register,
    verifyEmail,
    login,
    logout,
    resetPassword,
    verifyResetPassword,
    changePassword,
}