import { registerUser } from "../api/auth";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const response = await registerUser({ email, password });

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("Registration successful! Redirecting...");
        window.location.href = "/canvas.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }
});
