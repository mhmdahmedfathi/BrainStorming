const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const body = {
    name: registerForm["name"].value,
    username: registerForm["username"].value,
    password: registerForm["password"].value,
    password2: registerForm["password2"].value,
  };
  console.log(body);
  fetch("http://localhost:8080/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const body = {
    username: loginForm["username"].value,
    password: loginForm["password"].value,
  };
  console.log(body);
  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
});
