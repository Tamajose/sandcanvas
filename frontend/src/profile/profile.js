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
        imgContainer.dataset.id = creation._id;

        const img = document.createElement("img");
        img.src = `http://localhost:3000${creation.imagePath}`;
        img.alt = "Sand Creation";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "&times;";
        deleteBtn.title = "Delete Creation";

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        creationsGrid.appendChild(imgContainer);

        imgContainer.addEventListener("click", (e) => {
          if (e.target === deleteBtn) return;
          expandedImage.src = img.src;
          imageModal.style.display = "flex";
        });

        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm("Are you sure you want to delete this creation?")) {
            try {
              const res = await fetch(
                `http://localhost:3000/api/creations/${creation._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (res.ok) {
                imgContainer.remove();
                if (creationsGrid.children.length === 0) {
                  emptyState.style.display = "block";
                }
              } else {
                alert("Failed to delete creation");
              }
            } catch (error) {
              console.error("Delete Error:", error);
              alert("Error deleting creation");
            }
          }
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
