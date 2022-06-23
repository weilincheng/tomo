const renderMessagesHistory = async (
  accessToken,
  currentUserId,
  targetUserId
) => {
  const result = await fetch(
    `/api/v1/message/${currentUserId}/${targetUserId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const resultJson = await result.json();
  for (let i = 0; i < resultJson.length; i++) {
    const { sender_user_id, receiver_user_id, created_at, type, content } =
      resultJson[i];
    if (type === "placeholder") {
      continue;
    }
    const message = createMessage(
      sender_user_id,
      receiver_user_id,
      created_at,
      type,
      content,
      $("#messages-session")
    );
    prependMessage(message, sender_user_id);
  }
  const messageSession = $("#messages-session");
  messageSession.animate(
    { scrollTop: messageSession.prop("scrollHeight") },
    1000
  );
};

const renderSenderUser = async (accessToken, currentUserId) => {
  const result = await fetch(`/api/v1/message/${currentUserId}/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  const { messageUserIdList } = resultJson;
  for (let i = 0; i < messageUserIdList.length; i++) {
    const senderUserId = messageUserIdList[i].sender_user_id;
    const receiverUserId = messageUserIdList[i].receiver_user_id;
    const senderUserName = messageUserIdList[i].nickname;
    const senderUserProfileImage = messageUserIdList[i].profile_image;
    const senderUserLastMessage = messageUserIdList[i].content;
    renderSenderUserCard(
      currentUserId,
      accessToken,
      senderUserId === parseInt(currentUserId) ? receiverUserId : senderUserId,
      senderUserName,
      senderUserProfileImage,
      senderUserId === parseInt(currentUserId) ? "" : senderUserLastMessage
    );
  }
};

const renderSenderUserCard = (
  currentUserId,
  accessToken,
  senderUserId,
  senderUserName,
  senderUserProfileImage,
  senderUserLastMessage
) => {
  // if (senderUserId === parseInt(currentUserId)) {
  //   senderUserId = senderUserLastMessage.split("-")[1];
  //   senderUserName = senderUserLastMessage.split("-")[0];
  //   senderUserLastMessage = " ";
  // }
  const card = $('<div class="border-bottom row w-100 mb-2 "></div>');
  card.attr("id", `senderUserCard-UserId-${senderUserId}`);
  const profileImage = $(
    '<div class="col-3 d-flex align-items-center"><img class="rounded-pill img-fluid" src="https://via.placeholder.com/80"></div>'
  );
  const nameMessageCol = $(
    '<div class="col-9 d-flex flex-column justify-content-center my-2"></div>'
  );
  const name = $('<p class="fs-5 my-0 px-2"></p>').text(senderUserName);
  const lastMessage = $('<p class="fs-6 text-secondary my-0 px-2"></p>').text(
    senderUserLastMessage
  );
  nameMessageCol.append(name);
  // nameMessageCol.append(lastMessage);
  card.append(profileImage);
  card.append(nameMessageCol);
  $("#user-messages-session").append(card);
  card.click(() => {
    const targetUserId = card.attr("id").split("-")[2];
    // const receiverSocketId = card.attr("socket-id");
    $("#messages-session").attr("target-user-id", targetUserId);
    $("#messages-session").empty();
    renderMessagesHistory(accessToken, currentUserId, targetUserId);

    const sendMessageButton = $("#send-message-button");
    sendMessageButton.off();
    sendMessageButton.click(() => {
      const content = $("#message-content-input").val();
      const currentDate = new Date();
      const message = createMessage(
        currentUserId,
        targetUserId,
        currentDate,
        "text",
        content
      );
      appendMessage(message, currentUserId);
      $("#message-content-input").val("");
      emitPrivateMessage(
        localStorage.getItem("name"),
        currentUserId,
        targetUserId,
        $(`#senderUserCard-UserId-${targetUserId}`).attr("socket-id"),
        content,
        currentDate
      );
      saveMessages(currentUserId, targetUserId, "text", content);
    });
  });
};

const emitPrivateMessage = (
  currentUserName,
  currentUserId,
  targetUserId,
  receiverSocketId,
  content,
  currentDate
) => {
  socket.emit("private message", {
    currentUserName,
    currentUserId,
    targetUserId,
    content,
    to: receiverSocketId,
    currentDate,
  });
};

const checkAccessToken = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const result = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(result.error);
      return (window.location = "/");
    }
    const { nickname, location, website, id } = resultJson;
    localStorage.setItem("name", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    updateProfileIconLink(id);
  }
};

const createMessage = (
  senderUserId,
  receiverUserId,
  createdAt,
  type,
  content,
  target
) => {
  const date = new Date(createdAt);
  const [month, day, year, hour, minutes, seconds] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
    date.getHours(),
    date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes(),
    date.getSeconds(),
  ];
  const message = $("<div></div>");
  const messageContent = $(
    "<p class='btn btn-light fs-4 rounded-pill mb-0'></p>"
  ).text(content);
  const messageTime = $("<p class='fs-6 fw-lighter px-3'></p>").text(
    `${month}/${day}/${year} ${hour}:${minutes}:${seconds}`
  );
  message.append(messageContent);
  message.append(messageTime);
  return message;
};

const prependMessage = (message, sender_user_id) => {
  if (sender_user_id === parseInt(currentUserId)) {
    $("#messages-session").prepend(
      message.addClass("d-flex align-items-end flex-column")
    );
  } else {
    $("#messages-session").prepend(
      message.addClass("d-flex align-items-start flex-column")
    );
  }
};

const appendMessage = (message, sender_user_id) => {
  const messageSession = $("#messages-session");
  if (sender_user_id === parseInt(currentUserId)) {
    messageSession.append(
      message.addClass("d-flex align-items-end flex-column")
    );
  } else {
    messageSession.append(
      message.addClass("d-flex align-items-start flex-column")
    );
  }
  messageSession.animate(
    { scrollTop: messageSession.prop("scrollHeight") },
    1000
  );
};

const saveMessages = async (currentUserId, targetUserId, type, content) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const body = JSON.stringify({ type, content });
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    const result = await fetch(
      `/api/v1/message/${currentUserId}/${targetUserId}`,
      { method: "POST", headers, body }
    );
    if (result.error) {
      alert(result.error);
    }
  }
};

const updateSocketId = (targetUserId, socketId) => {
  const userCard = $(`#senderUserCard-UserId-${targetUserId}`);
  userCard.attr("socket-id", socketId);
};

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  alert("Please sign in!");
  window.location.href = "/";
}

checkAccessToken();
const currentUserId = parseInt(localStorage.getItem("userId"));
const currentUserName = localStorage.getItem("name");
renderSenderUser(accessToken, currentUserId);

const socket_host = $("#message-script").attr("socket_host");
const socket = io(socket_host, { autoConnect: false });
socket.auth = { currentUserName, currentUserId };
socket.connect();

socket.on("users", (users) => {
  users.forEach((user) => {
    const { userId, socketId } = user;
    updateSocketId(userId, socketId);
  });
});

socket.on(
  "private message",
  ({
    currentUserName,
    currentUserId,
    targetUserId,
    content,
    from,
    currentDate,
  }) => {
    const targetSocketId = $(`#senderUserCard-UserId-${currentUserId}`).attr(
      "socket-id"
    );
    if ($("#senderUserCard-UserId-" + currentUserId).length === 0) {
      renderSenderUserCard(
        targetUserId,
        accessToken,
        currentUserId,
        currentUserName
      );
    }
    if (from === targetSocketId) {
      const message = createMessage(
        parseInt(currentUserId),
        parseInt(targetUserId),
        currentDate,
        "text",
        content
      );
      if (
        parseInt($("#messages-session").attr("target-user-id")) ===
        parseInt(currentUserId)
      ) {
        appendMessage(message, currentUserId);
      }
    }
  }
);
