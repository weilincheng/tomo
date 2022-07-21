const EVENT_DELAY = 250;
const ANIMATE_DURATION = 1000;
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
let lastTime = new Date();
let lastProfileImage = false;
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
    const { senderUserId, receiverUserId, created_at, type, content } =
      resultJson[i];
    if (type === "placeholder") {
      continue;
    }
    const message = createMessage(
      senderUserId,
      receiverUserId,
      created_at,
      type,
      content,
      $("#messages-session")
    );
    prependMessage(message, created_at, senderUserId);
  }
  const messageSession = $("#messages-session");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    messageSession.animate(
      { scrollTop: messageSession.prop("scrollHeight") },
      ANIMATE_DURATION
    );
  }, EVENT_DELAY);
};

const renderSenderUser = async (accessToken, currentUserId) => {
  if (!currentUserId) {
    return;
  }
  const result = await fetch(`/api/v1/message/${currentUserId}/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  const { messageUserIdList } = resultJson;
  for (let i = 0; i < messageUserIdList.length; i++) {
    const senderUserId = messageUserIdList[i].senderUserId;
    const receiverUserId = messageUserIdList[i].receiverUserId;
    const senderUserName = messageUserIdList[i].nickname;
    const senderUserProfileImage = messageUserIdList[i].profileImage;
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
    lastTime = new Date();
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
      const ENTER_KEY = 13;
      if (e.which == ENTER_KEY) {
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
    "<p class='fs-5 rounded mb-1 px-4 py-3' style='cursor: default; max-width: 60%'></p>"
  ).text(content);
  const messageTime = $(
    "<p class='fs-6 lh-sm text-secondary text-opacity-75'></p>"
  ).text(`${months[month]} ${day}, ${year}, ${hour}:${minutes}`);
  message.append(messageContent);
  message.append(messageTime);
  return message;
};

const prependMessage = (message, createdDate, senderUserId) => {
  if (senderUserId === parseInt(currentUserId)) {
    $("#messages-session").prepend(
      message.addClass("d-flex align-items-end flex-column")
    );
    message.children().first().addClass("btn-info");
  } else {
    const messageWithProfile = $("<div class='d-flex'></div>");
    const profileImage = $("#target-user-profile-image").clone();
    profileImage.removeClass("align-self-center");
    profileImage.addClass("align-self-start me-2");
    profileImage.css({ width: "62px", height: "62px" });
    message.addClass("w-100 d-flex align-items-start flex-column");
    message.children().first().addClass("bg-light");
    messageWithProfile.append(profileImage);
    messageWithProfile.append(message);
    const [year1, month1, day1, hour1, minutes1] = [
      new Date(lastTime).getFullYear(),
      new Date(lastTime).getMonth(),
      new Date(lastTime).getDate(),
      new Date(lastTime).getHours(),
      new Date(lastTime).getMinutes(),
    ];
    const [year2, month2, day2, hour2, minutes2] = [
      new Date(createdDate).getFullYear(),
      new Date(createdDate).getMonth(),
      new Date(createdDate).getDate(),
      new Date(createdDate).getHours(),
      new Date(createdDate).getMinutes(),
    ];
    if (
      year1 === year2 &&
      month1 === month2 &&
      day1 === day2 &&
      hour1 === hour2 &&
      minutes1 === minutes2
    ) {
      profileImage.addClass("invisible");
    } else {
      lastTime = new Date(createdDate).getTime();
    }
    $("#messages-session").prepend(messageWithProfile);
  }
};

const appendMessage = (message, currentDate, senderUserId) => {
  const messageSession = $("#messages-session");
  if (parseInt(senderUserId) === parseInt(currentUserId)) {
    messageSession.append(
      message.addClass("d-flex align-items-end flex-column")
    );
    message.children().first().addClass("btn-info");
  } else {
    const messageWithProfile = $("<div class='d-flex w-100'></div>");
    const profileImage = $("#target-user-profile-image").clone();
    profileImage.removeClass("align-self-center");
    profileImage.addClass("align-self-start me-2");
    profileImage.css({ width: "62px", height: "62px" });
    message.addClass("w-100 d-flex align-items-start flex-column");
    message.children().first().addClass("bg-light");
    messageWithProfile.append(profileImage);
    messageWithProfile.append(message);
    const [year1, month1, day1, hour1, minutes1] = [
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      new Date().getHours(),
      new Date().getMinutes(),
    ];
    const [year2, month2, day2, hour2, minutes2] = [
      new Date(lastTime).getFullYear(),
      new Date(lastTime).getMonth(),
      new Date(lastTime).getDate(),
      new Date(lastTime).getHours(),
      new Date(lastTime).getMinutes(),
    ];

    if (
      year1 === year2 &&
      month1 === month2 &&
      day1 === day2 &&
      hour1 === hour2 &&
      minutes1 === minutes2
    ) {
      if (lastProfileImage !== false) {
        lastProfileImage.addClass("invisible");
        lastProfileImage = profileImage;
      }
    } else {
      lastProfileImage = profileImage;
      lastTime = new Date().getTime();
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

const updateOnlineStatus = (targetUserId, onlineStatus) => {
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
    updateOnlineStatus(data.disconnectingUserId, false);
  });

  socket.on("users", (users) => {
    users.forEach(async (user) => {
      const { userId, socketId } = user;
      updateSocketId(userId, socketId);
      const blockStatus = await getBlockStatus(accessToken, userId);
      if (!blockStatus.targetUserBlockCurrentUser) {
        updateOnlineStatus(userId, true);
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

const currentUserId = parseInt(localStorage.getItem("userId"));
const currentUserName = localStorage.getItem("nickname");
const sendMessageButton = $("#send-message-button");
const messageInput = $("#message-content-input");
sendMessageButton.hide();
messageInput.hide();
const socket_host = $("#message-script").attr("socket_host");
const socket = io(socket_host, { autoConnect: false });
initializeSenderSocket();
