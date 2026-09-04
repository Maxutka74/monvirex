import profileApi, { type Profile } from "../../features/profile/api/profileApi.ts";
import { create } from "zustand";

type ProfileStore = {
    profile: Profile | null;
    setAvatar: (avatar: string) => void;
    setUsername: (first_name: string, last_name: string) => void;
    refreshProfile: (email: string) => void;
}

const profileStore = create<ProfileStore>((set) => ({
    profile: null,

    setAvatar: (avatar) => set((state) => ({
        profile: state.profile
            ? {
                ...state.profile,
                avatar,
            }
            : null,
    })),

    setUsername: (first_name, last_name) => set((state) => ({
        profile: state.profile
        ? {
            ...state.profile,
            first_name: first_name,
            last_name: last_name,
        }
        : null,
    })),

    refreshProfile: async (email: string) => {
        const response = await profileApi.getProfile()

        set({profile: response[email]})
    }
}))

export default profileStore;