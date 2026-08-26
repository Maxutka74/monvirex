import { create } from 'zustand'
import type {User} from '../types/user'
import api from "../../../shared/api/instance"

export type UserStore = {
    user: User | null
    isAuth: boolean
    isLoading: boolean
    isStaff: boolean
    setUser: (user: User) => void
    clearUser: () => void
    checkAuth: () => Promise<void>
}

const useUserStore = create<UserStore>((set) => (
    {
        user: null,
        isAuth: false,
        isLoading: true,
        isStaff: false,

        setUser: (user) => set({ user,
                                            isAuth: true,
                                            isLoading: false
        }),

        clearUser: () => set({ user: null,
                                     isAuth: false,
                                     isLoading: false}),

        checkAuth: async () => {
            try {
                const response = await api.get('/auth/me/')

                console.log(response)
                set({
                    user: response.data,
                    isAuth: true,
                    isLoading: false,
                    isStaff: response.data.is_staff
                })
            } catch (e) {
                set({ user: null,
                      isAuth: false,
                      isLoading: false,
                      isStaff: false,
                    })

            }

        }
    }
    )
)

export default useUserStore