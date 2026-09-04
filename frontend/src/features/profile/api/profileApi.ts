import api from "../../../shared/api/instance.ts";

export type Profile = {
    'first_name': string,
    'last_name': string,
    'avatar': string,
}

export type ProfileResponse = Record<string, Profile>

export type UpdateProfile = {
    'first_name': string,
    'last_name': string,
}

export type UpdateAvatar = {
    'avatar': File
}

type UpdatePassword = {
    old_password: string,
    new_password: string,
    new_password_confirm: string
}

type DeleteProfile = {
    'password': string
}

const getProfile = async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile/')

    return response.data
}

const updateProfile = async (data: UpdateProfile): Promise<{first_name: string, last_name: string}> => {
    const response = await api.patch('/auth/profile/', data)

    return response.data
}

const updateAvatar = async (data: UpdateAvatar): Promise<{avatar: string}> => {
    const formData = new FormData()
    formData.append('avatar', data.avatar)

    const response = await api.patch('/auth/profile/avatar/', formData)

    return response.data
}

const deleteAvatar = async (): Promise<void> => {
    await api.delete('/auth/profile/avatar/')
}

const changePassword = async (data: UpdatePassword): Promise<void> => {
    await api.post('/auth/profile/change-password/', data)

}

const deleteProfile = async (data: DeleteProfile): Promise<void> => {
    await api.post('/auth/profile/delete/', data)
}

export default {
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    changePassword,
    deleteProfile,
}