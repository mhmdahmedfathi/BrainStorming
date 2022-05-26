const token = localStorage.getItem("token");

if (!token) {
  alert("You are not logged in");
  location.href = "./login.html";
}

const { username } = JSON.parse(localStorage.getItem("user-data"));

const topicTitle = document.querySelector("#topic-title");
const roomTitle = document.querySelector("#room-title");
const onlineCount = document.querySelector("#online-count");
const messagesList = document.querySelector("#messages-list");
const chatForm = document.querySelector("#chat-form");

const room = new URLSearchParams(window.location.search).get("room");

if (!room) {
  location.href = "./service.html";
}

topicTitle.innerText = room;
roomTitle.innerText = room + " chat room";
onlineCount.innerText = 0;

const parseMessage = (message) => {
  const names = message.name.split(" ");
  const nameInitials =
    names.length > 1
      ? names[0][0] + names[names.length - 1][0]
      : names[0][0] + names[0][1];

  if (message.username === username) {
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
        <div class="text-muted small font-italic">
          ${message.time}
        </div>
        <div class="font-weight-bold mb-1">
          ${message.name} | ${message.username}
        </div>
        ${message.message}
      </div>
    </div>`;
  } else {
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
        <div class="text-muted small font-italic">
          ${message.time}
        </div>
        <div class="font-weight-bold mb-1">
          ${message.name} | ${message.username}
        </div>
        ${message.message}
      </div>
    </div>`;
  }
};

const parseNotification = (notification) => {
  return `<div class="chat-message-center pb-4">
            <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                <div class="mb-1">${notification}</div>
            </div>
          </div>`;
};

document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:8080", {
    transports: ["websocket"],
    auth: {
      AccessToken: token,
    },
  });

  socket.on("connected", () => {
    socket.emit("joinRoom", room);
  });

  socket.on("message", (response) => {
    if (response.type === "joined-room") {
      messagesList.innerHTML += parseNotification(response.notification);
      onlineCount.innerText = response.onlineUsers;
      messagesList.scrollTop = messagesList.scrollHeight;
    } else if (response.type === "room-messages") {
      onlineCount.innerText = response.onlineUsers;
      response.messages.forEach((message) => {
        messagesList.innerHTML += parseMessage(message);
      });
    } else if (response.type === "new-message") {
      messagesList.innerHTML += parseMessage(response.message);
      messagesList.scrollTop = messagesList.scrollHeight;
    } else if (response.type === "left-room") {
      messagesList.innerHTML += parseNotification(response.notification);
      onlineCount.innerText = response.onlineUsers;
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;

    socket.emit("message", { room, message });

    e.target.elements.message.value = "";
    e.target.elements.message.focus();
  });
});
