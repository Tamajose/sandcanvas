const creationsGrid = document.getElementById("creations-grid");
const homeGrid = document.getElementById("home-grid");
const emptyState = document.getElementById("empty-state");
const imageModal = document.getElementById("image-modal");
const expandedImage = document.getElementById("expanded-image");
const closeModal = document.querySelector(".close-modal");
const profileModal = document.getElementById("profile-pic-modal");
const fileInput = document.getElementById("hidden-file-input");
const profileAvatar = document.getElementById("profile-avatar-clickable");

// --- AUTH CHECK ---
const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    window.location.href = "/signin";
    return false;
  }
  return true;
};

// --- SECTION SWITCHING ---
const sections = document.querySelectorAll(".content-section");
const sidebarItems = document.querySelectorAll(".sidebar-item");

const switchSection = (sectionId) => {
  sections.forEach((section) => {
    section.style.display =
      section.id === `${sectionId}-section` ? "flex" : "none";
  });

  sidebarItems.forEach((item) => {
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
  } else if (sectionId === "profile") {
    fetchUserProfile();
  }
};

sidebarItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    switchSection(item.dataset.section);
  });
});

// --- HOME GALLERY LOGIC ---
const loadHome = async () => {
  homeGrid.innerHTML = "";
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
      window.location.href = "/signin";
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch");

    const creations = await response.json();
    renderCreations(creations);
  } catch (error) {
    console.error("Error fetching creations: ", error);
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

// --- FETCH USER PROFILE ---
const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:3000/api/auth/info", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await response.json();
    console.log("Profile User Data:", user);

    document.getElementById("profile-name-display").textContent =
      user.name || "User";

    document.getElementById("profile-email-display").textContent = user.email;

    const date = new Date(user.createdAt);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

    document.getElementById("profile-date-display").textContent = formattedDate;

    if (user.profileImage?.url) {
      const img = document.getElementById("profile-display-img");
      const placeholder = document.getElementById("profile-pic-placeholder");
      img.src = user.profileImage.url;
      img.style.display = "block";
      placeholder.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};
// --- PROFILE PICTURE LOGIC ---
profileAvatar.addEventListener(
  "click",
  () => (profileModal.style.display = "flex"),
);
document
  .getElementById("btn-close-profile-modal")
  .addEventListener("click", () => (profileModal.style.display = "none"));
// Change Logic
document.getElementById("btn-change-pic").addEventListener("click", () => {
  profileModal.style.display = "none";
  fileInput.click();
});
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("image", file);
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:3000/api/user/profile-picture", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      const img = document.getElementById("profile-display-img");
      const placeholder = document.getElementById("profile-pic-placeholder");

      img.src = data.user.profileImage.url;
      img.style.display = "block";
      placeholder.style.display = "none";
      alert("Profile picture updated!");
    }
  } catch (err) {
    alert("Upload failed");
  }
});
// Delete Logic
document
  .getElementById("btn-delete-pic")
  .addEventListener("click", async () => {
    if (!confirm("Remove profile picture?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:3000/api/user/profile-picture",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        document.getElementById("profile-display-img").style.display = "none";
        document.getElementById("profile-pic-placeholder").style.display =
          "flex";
        profileModal.style.display = "none";
        alert("Profile picture removed!");
      }
    } catch (err) {
      alert("Delete failed");
    }
  });

// --- INITIALIZATION ---
if (checkAuth()) {
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
  window.location.href = "/signin";
});

const toggleBtn = document.getElementById("themeToggle");
const moonIcon = document.getElementById("moonIcon");
const sunIcon = document.getElementById("sunIcon");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  moonIcon.style.display = "none";
  sunIcon.style.display = "block";
}
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  if (isLight) {
    moonIcon.style.display = "none";
    sunIcon.style.display = "block";
    localStorage.setItem("theme", "light");
  } else {
    moonIcon.style.display = "block";
    sunIcon.style.display = "none";
    localStorage.setItem("theme", "dark");
  }
});
