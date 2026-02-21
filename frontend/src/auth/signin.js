import { loginUser } from "../api/auth";
import "../api/googleAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("username-email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await loginUser({ email, password });

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("Login successful! Redirecting...");
        window.location.href = "/canvas.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }
});
