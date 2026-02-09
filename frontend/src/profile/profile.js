const creationsGrid = document.getElementById("creations-grid");
const emptyState = document.getElementById("empty-state");
const imageModal = document.getElementById("image-modal");
const expandedImage = document.getElementById("expanded-image");
const closeModal = document.querySelector(".close-modal");

const fetchCreations = async () => {
  const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token);

  if (!token || token === "undefined" || token === "null") {
    console.log("No valid token found, redirecting to sign-in...");
    window.location.href = "/signin.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/creations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.log("Unauthorized (401), clearing token and redirecting...");
      localStorage.removeItem("token");
      window.location.href = "/signin.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch creations");
    }

    const creations = await response.json();
    console.log("Fetched creations:", creations);

    if (creations.length > 0) {
      emptyState.style.display = "none";
      creationsGrid.innerHTML = "";

      creations.forEach((creation) => {
        const imgContainer = document.createElement("div");
        imgContainer.className = "creation-item";

        const img = document.createElement("img");
        img.src = `http://localhost:3000${creation.imagePath}`;
        img.alt = "Sand Creation";

        imgContainer.appendChild(img);
        creationsGrid.appendChild(imgContainer);

        imgContainer.addEventListener("click", () => {
          expandedImage.src = img.src;
          imageModal.style.display = "flex";
        });
      });
    } else {
      emptyState.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching creations: ", error);
  }
};

closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
  }
});

fetchCreations();

//Logout
const signoutBtn = document.querySelector(".btn-signout");
signoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/signin.html";
});
