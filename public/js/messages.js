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
};

const renderSenderUser = async (accessToken, currentUserId) => {
  const result = await fetch(`/api/v1/message/${currentUserId}/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  const { senderUserIdList } = resultJson;
  for (let i = 0; i < senderUserIdList.length; i++) {
    const senderUserId = senderUserIdList[i].sender_user_id;
    const senderUserName = senderUserIdList[i].name;
    const senderUserProfileImage = senderUserIdList[i].profile_image;
    const senderUserLastMessage = senderUserIdList[i].content;
    renderSenderUserCard(
      currentUserId,
      accessToken,
      senderUserId,
      senderUserName,
      senderUserProfileImage,
      senderUserLastMessage
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
  const card = $('<div class="row w-100 mb-2"></div>');
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
  nameMessageCol.append(lastMessage);
  card.append(profileImage);
  card.append(nameMessageCol);
  $("#user-messages-session").append(card);
  card.click(() => {
    const targetUserId = card.attr("id").split("-")[2];
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
      saveMessages(currentUserId, targetUserId, "text", content);
    });
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
    const { name, location, website, id } = resultJson;
    localStorage.setItem("name", name);
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
  if (sender_user_id === parseInt(currentUserId)) {
    $("#messages-session").append(
      message.addClass("d-flex align-items-end flex-column")
    );
  } else {
    $("#messages-session").append(
      message.addClass("d-flex align-items-start flex-column")
    );
  }
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

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  alert("Please sign in!");
  window.location.href = "/";
}

checkAccessToken();
const currentUserId = parseInt(localStorage.getItem("userId"));
renderSenderUser(accessToken, currentUserId);
// const targetUserId = 1;
// renderMessagesHistory(accessToken, currentUserId, targetUserId);
