const registerNavLink = document.querySelector("#register-nav-link");
const loginNavLink = document.querySelector("#login-nav-link");
const userNavLink = document.querySelector("#user-nav-link");
const logoutNavLink = document.querySelector("#logout-nav-link");

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user-data");
  let username = "";
  if (userData) {
    username = JSON.parse(userData).username;
  }
  const isRegisterPage = window.location.href.includes("register");
  const isLoginPage = window.location.href.includes("login");

  if (!isRegisterPage && !isLoginPage) {
    if (token) {
      registerNavLink.style.display = "none";
      loginNavLink.style.display = "none";
      userNavLink.style.display = "block";
      userNavLink.innerText = username;
      logoutNavLink.style.display = "block";
    } else {
      registerNavLink.style.display = "block";
      loginNavLink.style.display = "block";
      userNavLink.style.display = "none";
      logoutNavLink.style.display = "none";
    }
  }

  if (token && (isRegisterPage || isLoginPage)) {
    alert("You are already logged in");
    location.href = "./index.html";
  }
});

logoutNavLink?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user-data");
  alert("You have been logged out");
  location.href = "./index.html";
});

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const body = {
    name: registerForm["name"].value,
    username: registerForm["username"].value,
    password: registerForm["password"].value,
    password2: registerForm["password2"].value,
  };

  fetch("http://localhost:8080/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((responseData) => {
      const { data, ApiStatus, token, error } = responseData;

      if (ApiStatus) {
        localStorage.setItem("token", token);
        localStorage.setItem("user-data", JSON.stringify(data));
        registerForm.reset();
        window.location.href = "./index.html";
      } else {
        alert(error);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const body = {
    username: loginForm["username"].value,
    password: loginForm["password"].value,
  };

  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((responseData) => {
      const { data, ApiStatus, token, error } = responseData;

      if (ApiStatus) {
        localStorage.setItem("token", token);
        localStorage.setItem("user-data", JSON.stringify(data));
        loginForm.reset();
        window.location.href = "./index.html";
      } else {
        alert(error);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
