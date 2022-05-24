const registerNavLink = document.querySelector("#register-nav-link");
const loginNavLink = document.querySelector("#login-nav-link");

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  const isRegisterPage = window.location.href.includes("register");
  const isLoginPage = window.location.href.includes("login");

  if (token && (isRegisterPage || isLoginPage)) {
    alert("You are already logged in");
    location.href = "./index.html";
  }
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
