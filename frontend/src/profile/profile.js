const creationsGrid = document.getElementById("creations-grid");
const homeGrid = document.getElementById("home-grid");
const emptyState = document.getElementById("empty-state");
const imageModal = document.getElementById("image-modal");
const expandedImage = document.getElementById("expanded-image");
const closeModal = document.querySelector(".close-modal");

// --- FETCH LOGIC ---


// --- AUTH CHECK ---
const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    window.location.href = "/signin.html";
    return false;
  }
  return true;
};

// --- SECTION SWITCHING ---
const sections = document.querySelectorAll(".content-section");
const sidebarItems = document.querySelectorAll(".sidebar-item");

const switchSection = (sectionId) => {
  sections.forEach(section => {
    section.style.display = section.id === `${sectionId}-section` ? "flex" : "none";
  });

  sidebarItems.forEach(item => {
    if (item.dataset.section === sectionId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  if (sectionId === "home") {
    loadHome();
  } else if (sectionId === "creations") {
    fetchCreations();
  }
};

sidebarItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    switchSection(item.dataset.section);
  });
});

// --- HOME GALLERY LOGIC ---
const loadHome = async () => {
  // Note: Home gallery is currently empty until public backend endpoint is ready
  homeGrid.innerHTML = "";

  // Future implementation:
  // const response = await fetch("http://localhost:3000/api/creations/public");
  // const publicData = await response.json();
  // ... render logic
};

document.getElementById("sort-select").addEventListener("change", loadHome);


// --- FETCH CREATIONS LOGIC ---
const fetchCreations = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/api/creations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/signin.html";
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch");

    const creations = await response.json();
    renderCreations(creations);
  } catch (error) {
    console.error("Error fetching creations: ", error);
    // Silent fail or show mock if requested? For now just keep empty state
    emptyState.style.display = "block";
  }
};

const renderCreations = (creations) => {
  if (creations.length > 0) {
    emptyState.style.display = "none";
    creationsGrid.innerHTML = "";

    creations.forEach((creation) => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "creation-item";

      const imgSrc = creation.imagePath.startsWith("/assets")
        ? creation.imagePath
        : `http://localhost:3000${creation.imagePath}`;

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "Sand Creation";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "&times;";

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
        const currentToken = localStorage.getItem("token");

        if (confirm("Are you sure you want to delete this creation?")) {
          try {
            const res = await fetch(
              `http://localhost:3000/api/creations/${creation._id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${currentToken}`,
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
};

// --- INITIALIZATION ---
if (checkAuth()) {
  // Default to Home page
  switchSection("home");
}

// Modal closing logic
closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
  }
});

// Logout
const signoutBtn = document.querySelector(".btn-signout");
signoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/signin.html";
});

