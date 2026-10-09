import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: true,
      port: 5173,
      allowedHosts: env.ALLOWED_HOSTS
        ? env.ALLOWED_HOSTS.split(",").map(host => host.trim())
        : [],
    },
  };
});