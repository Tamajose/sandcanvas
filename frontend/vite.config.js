import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  input: {
    main: "index.html",
    canvas: "canvas.html",
    signin: "signin.html",
    signup: "signup.html",
    profile: "profile.html",
  },
});
