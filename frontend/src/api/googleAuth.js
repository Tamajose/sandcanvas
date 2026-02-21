const API_URL = import.meta.env.VITE_API_URL;

function initGoogle(){
    if(!window.google){
        console.log("Google not loaded yet, retrying..");
        setTimeout(initGoogle, 100);
        return;
    }

    google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
            theme: "outline", 
            size: "large",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left"
        }
    );
}

document.addEventListener("DOMContentLoaded", initGoogle);

async function handleCredentialResponse(response) {
    try{
        // console.log("Google Response: ", response);
        const token = response.credential;
        if(!token) return alert("No token received from Google!");
        const res = await fetch(`${API_URL}/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                credential: response.credential
            })
        });

        const data = await res.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Google Signin Successful! Redirecting...");
        window.location.href = "/canvas.html";
    } catch (err) {
        console.error("Google Signin error: ", err);
        alert(err.message);
    }
}