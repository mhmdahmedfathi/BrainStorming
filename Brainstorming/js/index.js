const registerNavLink = document.querySelector("#register-nav-link");
const loginNavLink = document.querySelector("#login-nav-link");
const userNavLink = document.querySelector("#user-nav-link");
const logoutNavLink = document.querySelector("#logout-nav-link");

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

// wait for the page to finish loading
window.addEventListener("load", () => {
  // get the token from the local storage
  const token = localStorage.getItem("token");

  // get the user data from the local storage
  const userData = localStorage.getItem("user-data");
  let username = "";

  // if there is a user data in the local storage, the get the username
  if (userData) {
    username = JSON.parse(userData).username;
  }

  // check if the page is the register page or the login page
  const isRegisterPage = window.location.href.includes("register");
  const isLoginPage = window.location.href.includes("login");

  // if the page is neither the register page nor the login page
  if (!isRegisterPage && !isLoginPage) {
    if (token) {
      // if there is a token in the local storage
      registerNavLink.style.display = "none"; // hide the register nav link from the nav bar
      loginNavLink.style.display = "none"; // hide the login nav link from the nav bar
      userNavLink.style.display = "block"; // show the user nav link in the nav bar
      userNavLink.innerText = username; // set the user nav link to the username of the logged in user
      logoutNavLink.style.display = "block"; // show the logout nav link in the nav bar
    } else {
      // if there is no token in the local storage
      registerNavLink.style.display = "block"; // show the register nav link in the nav bar
      loginNavLink.style.display = "block"; // show the login nav link in the nav bar
      userNavLink.style.display = "none"; // hide the user nav link from the nav bar
      logoutNavLink.style.display = "none"; // hide the logout nav link from the nav bar
    }
  }

  // if the page is the register page or the login page, and the user is logged in, redirect to the home page
  if (token && (isRegisterPage || isLoginPage)) {
    alert("You are already logged in");
    location.href = "./index.html";
  }
});

// listen for a click on the logout nav link
logoutNavLink?.addEventListener("click", () => {
  // remove the token from the local storage
  localStorage.removeItem("token");

  // remove the user data from the local storage
  localStorage.removeItem("user-data");

  alert("You have been logged out");

  // redirect to home page
  location.href = "./index.html";
});

// listen for the submit event on the register form
registerForm?.addEventListener("submit", (e) => {
  // prevent the page from reloading after the form is submitted
  e.preventDefault();

  // the body of the request contains the data from the form and trim the whitespace
  const body = {
    name: registerForm["name"].value.trim(),
    username: registerForm["username"].value.trim(),
    password: registerForm["password"].value.trim(),
    password2: registerForm["password2"].value.trim(),
  };

  // make a post request to the signup endpoint with the body of the request to the server
  fetch("http://localhost:8080/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((responseData) => {
      // get the response data
      const { data, ApiStatus, token, error } = responseData;

      if (ApiStatus) {
        // if the server response is successfully registered

        // set the token in the local storage
        localStorage.setItem("token", token);

        // set the user data in the local storage
        localStorage.setItem("user-data", JSON.stringify(data));

        // reset the register form
        registerForm.reset();

        // redirect to home page
        window.location.href = "./index.html";
      } else {
        // if the server response is not successfully registered, show the error message
        alert(error);
      }
    })
    .catch((err) => {
      // if there is an error, show the error message
      alert("An error happen while process your request. Please try again");
      console.log(err);
    });
});

// listen for the submit event on the login form
loginForm?.addEventListener("submit", (e) => {
  // prevent the page from reloading after the form is submitted
  e.preventDefault();

  // the body of the request contains the data from the form and trim the whitespace
  const body = {
    username: loginForm["username"].value.trim(),
    password: loginForm["password"].value.trim(),
  };

  // make a post request to the login endpoint with the body of the request to the server
  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((responseData) => {
      // get the response data
      const { data, ApiStatus, token, error } = responseData;

      if (ApiStatus) {
        // if the server response is successfully logged in

        // set the token in the local storage
        localStorage.setItem("token", token);

        // set the user data in the local storage
        localStorage.setItem("user-data", JSON.stringify(data));

        // reset the login form
        loginForm.reset();

        // redirect to home page
        window.location.href = "./index.html";
      } else {
        // if the server response is not successfully logged in, show the error message
        alert(error);
      }
    })
    .catch((err) => {
      // if there is an error, show the error message
      alert("An error happen while process your request. Please try again");
      console.log(err);
    });
});
