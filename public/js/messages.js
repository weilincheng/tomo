const getBlockStatus = async (accessToken, targetUserId) => {
  const result = await fetch(`/api/v1/user/block/${targetUserId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  return resultJson;
};

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
  const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
  const card = $('<div class="border-bottom row w-100 py-3 px-3"></div>');
  card.attr("id", `senderUserCard-UserId-${senderUserId}`);
  const profileImageDiv = $(
    '<div class="col-2 d-flex align-self-center position-relative"></div>'
  );
  profileImageDiv.css({
    display: "inline-block",
    width: "50px",
    height: "50px",
    "border-radius": "50%",
    "background-repeat": "no-repeat",
    "background-position": "center center",
    "background-size": "cover",
    "background-image": `url("https://via.placeholder.com/100")`,
  });
  if (senderUserProfileImage) {
    if (senderUserProfileImage.slice(0, 5) === "https") {
      profileImageDiv.css("background-image", `url(${senderUserProfileImage})`);
    } else {
      profileImageDiv.css(
        "background-image",
        `url('${cloudfrontUrl}/${senderUserProfileImage}')`
      );
    }
  }

  const nameMessageCol = $(
    '<div class="col-9 d-flex flex-column justify-content-center my-2"></div>'
  );
  const name = $('<p class="fs-5 my-0 px-2 "></p>').text(senderUserName);
  const lastMessage = $('<p class="fs-6 text-secondary my-0 px-2"></p>').text(
    senderUserLastMessage
  );
  const badge = $(
    '<span class="position-absolute top-0 start-100 translate-middle p-2 bg-secondary border border-light rounded-circle"></span>'
  );
  badge.attr("id", `badge-UserId-${senderUserId}`);
  profileImageDiv.append(badge);
  nameMessageCol.append(name);
  nameMessageCol.append(lastMessage);
  card.append(profileImageDiv);
  card.append(nameMessageCol);
  $("#user-messages-session").append(card);
  card.click(async () => {
    const targetUserId = card.attr("id").split("-")[2];
    const blockStatus = await getBlockStatus(accessToken, targetUserId);
    if (blockStatus.targetUserBlockCurrentUser) {
      alert("You are blocked by this user.");
      return;
    }
    $("#messages-session").attr("target-user-id", targetUserId);
    $("#messages-session").empty();
    renderMessagesHistory(accessToken, currentUserId, targetUserId);
    const sendMessageButton = $("#send-message-button");
    const messageInput = $("#message-content-input");
    sendMessageButton.show();
    messageInput.show();
    sendMessageButton.click(() => {
      const content = $("#message-content-input").val();
      if (content === "") {
        return;
      }
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
  const messageContent = $("<p class='btn fs-4 rounded-pill mb-0'></p>").text(
    content
  );
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
    message.children().first().addClass("btn-info");
  } else {
    $("#messages-session").prepend(
      message.addClass("d-flex align-items-start flex-column")
    );
    message.children().first().addClass("btn-light");
  }
};

const appendMessage = (message, sender_user_id) => {
  const messageSession = $("#messages-session");
  if (parseInt(sender_user_id) === parseInt(currentUserId)) {
    messageSession.append(
      message.addClass("d-flex align-items-end flex-column")
    );
    message.children().first().addClass("btn-info");
  } else {
    messageSession.append(
      message.addClass("d-flex align-items-start flex-column")
    );
    message.children().first().addClass("btn-light");
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

const updateOnlinStatus = (targetUserId, onlineStatus) => {
  const badge = $(`#badge-UserId-${targetUserId}`);
  if (onlineStatus) {
    badge.removeClass("bg-secondary");
    badge.addClass("bg-primary");
  } else {
    badge.removeClass("bg-primary");
    badge.addClass("bg-secondary");
  }
};

const initializeSenderSocket = async () => {
  await renderSenderUser(accessToken, currentUserId);
  const socket_host = $("#message-script").attr("socket_host");
  const socket = io(socket_host, { autoConnect: false });
  socket.auth = { currentUserName, currentUserId };
  socket.connect();

  socket.on("user disconnecting", (data) => {
    updateOnlinStatus(data.disconnectingUserId, false);
  });

  socket.on("users", (users) => {
    users.forEach((user) => {
      const { userId, socketId } = user;
      updateSocketId(userId, socketId);
      updateOnlinStatus(userId, true);
    });
  });

  socket.on(
    "private message",
    ({
      currentUserName: senderUserName,
      currentUserId: senderUserId,
      targetUserId: receiverUserId,
      content,
      from,
      currentDate,
    }) => {
      const targetSocketId = $(`#senderUserCard-UserId-${senderUserId}`).attr(
        "socket-id"
      );
      if ($("#senderUserCard-UserId-" + senderUserId).length === 0) {
        renderSenderUserCard(
          receiverUserId,
          accessToken,
          senderUserId,
          senderUserName,
          null,
          content
        );
        updateSocketId(senderUserId, from);
      }
      if (from === targetSocketId) {
        const message = createMessage(
          parseInt(senderUserId),
          parseInt(receiverUserId),
          currentDate,
          "text",
          content
        );
        if (
          parseInt($("#messages-session").attr("target-user-id")) ===
          parseInt(senderUserId)
        ) {
          appendMessage(message, senderUserId);
        }
      }
    }
  );
};

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  alert("Please log in first!");
  window.location.href = "/";
}

checkAccessToken();
const currentUserId = parseInt(localStorage.getItem("userId"));
const currentUserName = localStorage.getItem("name");
const sendMessageButton = $("#send-message-button");
const messageInput = $("#message-content-input");
sendMessageButton.hide();
messageInput.hide();
initializeSenderSocket();
