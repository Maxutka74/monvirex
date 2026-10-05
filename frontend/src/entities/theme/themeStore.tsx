import { createStore } from "zustand/vanilla";

type Theme = "dark" | "white";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const savedTheme = localStorage.getItem("CHANGE_THEME");

const themeStore = createStore<ThemeStore>((set) => ({
  theme: savedTheme === "dark" ? "dark" : "white",

  setTheme: (theme) => {
    localStorage.setItem("CHANGE_THEME", theme);

    set({ theme });
  },
}));

export default themeStore;
