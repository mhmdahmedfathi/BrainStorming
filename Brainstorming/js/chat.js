// a list of all the available room names
const availableRoom = [
  "studying",
  "traveling",
  "gathering",
  "learning",
  "shopping",
  "playing",
  "scripting",
  "reading",
];

// get the token from the local storage
const token = localStorage.getItem("token");

// if there is no token in the local storage, redirect to the login page
if (!token) {
  alert("You are not logged in");
  location.href = "./login.html";
}

// get the room name from the url
const room = new URLSearchParams(window.location.search).get("room");

// if the room is not found or the room is not available, redirect to the groups page
if (!room || !availableRoom.includes(room)) {
  location.href = "./service.html";
}

// get the username from the local storage
const { username } = JSON.parse(localStorage.getItem("user-data"));

const topicTitle = document.querySelector("#topic-title");
const roomTitle = document.querySelector("#room-title");
const onlineCount = document.querySelector("#online-count");
const messagesList = document.querySelector("#messages-list");
const chatForm = document.querySelector("#chat-form");

topicTitle.innerText = room; // set the topic title
roomTitle.innerText = room + " chat room"; // set the room title
onlineCount.innerText = 0; // set the online count to 0

// this function parses the message in the HTML template and returns it to be appended to the messages list
function parseMessage(message) {
  // get the user's name initial characters
  const names = message.name.split(" ");
  const nameInitials =
    names.length > 1
      ? names[0][0] + names[names.length - 1][0]
      : names[0][0] + names[0][1];

  if (message.username === username) {
    // if the message is sent by the logged in user

    return `<div class="chat-message-right pb-4">
      <div class="d-flex flex-column">
          <div 
            class="bg-primary d-flex align-items-center justify-content-center text-white rounded-circle mx-1" 
            alt=${message.name} 
            style="width: 40px; height: 40px">
              ${nameInitials.toUpperCase()}
          </div>
        </div>
      <div class="flex-shrink-1 bg-light rounded pb-2 px-3">
        <div class="font-weight-bold py-1">
          ${message.name} | ${message.username}
        </div>
        <p>${message.message}</p>
        <small class="text-muted text-right small d-block font-italic">
          ${message.time}
        </small>
      </div>
    </div>`;
  } else {
    // if the message is sent by another user

    return `<div class="chat-message-left pb-4">
      <div class="d-flex flex-column">
          <div 
            class="bg-warning d-flex align-items-center justify-content-center text-white rounded-circle mx-1" 
            alt=${message.name} 
            style="width: 40px; height: 40px">
              ${nameInitials.toUpperCase()}
          </div>
        </div>
      <div class="flex-shrink-1 bg-light rounded pb-2 px-3">
        <div class="font-weight-bold py-1">
          ${message.name} | ${message.username}
        </div>
        <p>${message.message}</p>
        <small class="text-muted text-right small d-block font-italic">
          ${message.time}
        </small>
      </div>
    </div>`;
  }
}

// this function parses the notification in the HTML template and returns it to be appended to the messages list
const parseNotification = (notification) => {
  return `<div class="chat-message-center pb-4">
            <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                <div class="mb-1">${notification}</div>
            </div>
          </div>`;
};

// wait for the page to load
window.addEventListener("load", () => {
  // create a socket connection
  const socket = io("http://localhost:8080", {
    transports: ["websocket"],
    auth: {
      AccessToken: token, // send the token to the server
    },
  });

  // when the socket connection is established, join the room
  socket.on("connected", () => {
    socket.emit("joinRoom", room);
  });

  // when there is a message from the server
  socket.on("message", (response) => {
    if (response.type === "joined-room") {
      // if the user joined the room

      // parse the notification that a new user joined the room
      messagesList.innerHTML += parseNotification(response.notification);

      // update the online count
      onlineCount.innerText = response.onlineUsers;

      // scroll to the bottom of the messages list
      messagesList.scrollTop = messagesList.scrollHeight;
    } else if (response.type === "room-messages") {
      // if the user received the room messages

      // update the online count
      onlineCount.innerText = response.onlineUsers;

      // parse the messages
      response.messages.forEach((message) => {
        messagesList.innerHTML += parseMessage(message);
      });
    } else if (response.type === "new-message") {
      // if the user received a new message

      // parse the message
      messagesList.innerHTML += parseMessage(response.message);

      // scroll to the bottom of the messages list
      messagesList.scrollTop = messagesList.scrollHeight;
    } else if (response.type === "left-room") {
      // if a user left the room

      // parse the notification that a user left the room
      messagesList.innerHTML += parseNotification(response.notification);

      // update the online count
      onlineCount.innerText = response.onlineUsers;

      // scroll to the bottom of the messages list
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  });

  // listen for a submit event on the chat form
  chatForm.addEventListener("submit", (e) => {
    // prevent the page from reloading when the form is submitted
    e.preventDefault();

    // get the message from the input field and trim it
    const message = e.target.elements.message.value.trim();

    // if the message is not empty
    if (message) {
      // send the message and the room name to the server
      socket.emit("message", { room, message });

      // clear the input field after the message is sent to the server
      e.target.elements.message.value = "";
      e.target.elements.message.focus();
    }
  });
});
