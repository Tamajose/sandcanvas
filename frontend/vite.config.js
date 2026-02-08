import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
  },
  input: {
    main: "index.html",
    canvas: "canvas.html",
    signin: "signin.html",
    signup: "signup.html",
  },
});
