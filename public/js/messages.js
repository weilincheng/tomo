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
let timeout = false;
let curTime = new Date();
let lastCreatedDate = new Date("1971-01-01T23:50:21.817Z");
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
    prependMessage(message, created_at, sender_user_id);
  }
  const messageSession = $("#messages-session");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    messageSession.animate(
      { scrollTop: messageSession.prop("scrollHeight") },
      1000
    );
  }, 250);
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
  const card = $(
    '<div class="row w-100 py-2 ps-4" style="min-height:100px; cursor:pointer;"></div>'
  );
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
    $("[id^=senderUserCard-UserId]").removeClass("selected-user-card");
    card.addClass("selected-user-card");
    const targetUserId = card.attr("id").split("-")[2];
    const blockStatus = await getBlockStatus(accessToken, targetUserId);
    $("#messages-session").empty();
    $("#target-user-banner").empty();
    if (blockStatus.targetUserBlockCurrentUser) {
      $("#messages-session").addClass("invisible");
      $("#alertModalToggleLabel").text("You are blocked by this user.");
      $("#alertModalToggle").modal("show");
      return;
    }
    $("#messages-session").attr("target-user-id", targetUserId);
    $("#messages-session").removeClass("invisible");
    const userBanner = $('<div class="d-flex align-items-center">');
    const profileImage = card.children().first().clone();
    profileImage.empty();
    profileImage.css({ width: "30px", height: "30px" });
    profileImage.attr("id", "target-user-profile-image");
    const profileName = card.children().last().children().first().clone();
    profileName.addClass("fs-3 fw-bold");
    profileName.html(
      `<a class='text-decoration-none fw-bold' style='color: #0773f4;' href='/user/${senderUserId}' target='_blank'>${name.text()}</a>`
    );
    userBanner.append(profileImage);
    userBanner.append(profileName);
    $("#target-user-banner").append(userBanner);
    renderMessagesHistory(accessToken, currentUserId, targetUserId);
    const sendMessageButton = $("#send-message-button");
    const messageInput = $("#message-content-input");
    sendMessageButton.show();
    messageInput.show();
    sendMessageButton.click(() => {
      emitSaveMessages(currentUserId, targetUserId);
    });
    $("#message-content-input").on("keypress", (e) => {
      if (e.which == 13) {
        emitSaveMessages(currentUserId, targetUserId);
      }
    });
  });
};

const emitSaveMessages = (currentUserId, targetUserId) => {
  const content = $("#message-content-input").val().trim();
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
  appendMessage(message, currentDate, currentUserId);
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
    date.getMonth(),
    date.getDate(),
    date.getFullYear(),
    date.getHours(),
    date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes(),
    date.getSeconds(),
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const message = $("<div></div>");
  const messageContent = $(
    "<p class='fs-5 rounded-pill mb-1 px-3 py-2' style='cursor: default'></p>"
  ).text(content);
  const messageTime = $(
    "<p class='fs-6 lh-sm text-secondary text-opacity-75'></p>"
  ).text(`${months[month]} ${day}, ${year}, ${hour}:${minutes}`);
  message.append(messageContent);
  message.append(messageTime);
  return message;
};

const prependMessage = (message, createdDate, sender_user_id) => {
  if (sender_user_id === parseInt(currentUserId)) {
    $("#messages-session").prepend(
      message.addClass("d-flex align-items-end flex-column")
    );
    message.children().first().addClass("btn-info");
  } else {
    const messageWithProfile = $("<div class='d-flex'></div>");
    const profileImage = $("#target-user-profile-image").clone();
    profileImage.removeClass("align-self-center");
    profileImage.addClass("align-self-start me-2");
    profileImage.css({ width: "46px", height: "46px" });
    message.addClass("d-flex align-items-start flex-column");
    message.children().first().addClass("bg-light");
    messageWithProfile.append(profileImage);
    messageWithProfile.append(message);
    if (Date(createdDate) - lastCreatedDate < 60000) {
      profileImage.addClass("invisible");
    } else {
      lastCreatedDate = Date(createdDate);
    }
    $("#messages-session").prepend(messageWithProfile);
  }
};

const appendMessage = (message, currentDate, sender_user_id) => {
  const messageSession = $("#messages-session");
  if (parseInt(sender_user_id) === parseInt(currentUserId)) {
    messageSession.append(
      message.addClass("d-flex align-items-end flex-column")
    );
    message.children().first().addClass("btn-info");
  } else {
    const messageWithProfile = $("<div class='d-flex'></div>");
    const profileImage = $("#target-user-profile-image").clone();
    profileImage.removeClass("align-self-center");
    profileImage.addClass("align-self-start me-2");
    profileImage.css({ width: "46px", height: "46px" });
    message.addClass("d-flex align-items-start flex-column");
    message.children().first().addClass("bg-light");
    messageWithProfile.append(profileImage);
    messageWithProfile.append(message);
    console.log(Date.now() - curTime);
    if (Date.now() - curTime < 60000) {
      profileImage.addClass("invisible");
      message.children().last().addClass("invisible");
      message.children().last().hide();
    } else {
      curTime = Date.now();
    }
    $("#messages-session").append(messageWithProfile);
  }
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    messageSession.animate(
      { scrollTop: messageSession.prop("scrollHeight") },
      1000
    );
  }, 250);
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
  socket.auth = { currentUserName, currentUserId };
  socket.connect();

  socket.on("user disconnecting", (data) => {
    updateOnlinStatus(data.disconnectingUserId, false);
  });

  socket.on("users", (users) => {
    users.forEach(async (user) => {
      const { userId, socketId } = user;
      updateSocketId(userId, socketId);
      const blockStatus = await getBlockStatus(accessToken, userId);
      if (!blockStatus.targetUserBlockCurrentUser) {
        updateOnlinStatus(userId, true);
      }
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
          appendMessage(message, currentDate, senderUserId);
        }
      }
    }
  );
};

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
const socket_host = $("#message-script").attr("socket_host");
const socket = io(socket_host, { autoConnect: false });
initializeSenderSocket();
