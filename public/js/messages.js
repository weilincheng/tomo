const renderMessagesHistory = async (
  accessToken,
  currentUserId,
  targetUserId
) => {
  const result = await fetch(
    `/api/v1/message/?currentUserId=${currentUserId}&targetUserId=${targetUserId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const resultJson = await result.json();
  console.log(resultJson);
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
    if (sender_user_id === parseInt(currentUserId)) {
      $("#messages-session").prepend(
        message.addClass("d-flex align-items-end flex-column")
      );
    } else {
      $("#messages-session").prepend(
        message.addClass("d-flex align-items-start flex-column")
      );
    }
  }
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
    date.getMinutes(),
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

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  alert("Please sign in!");
  window.location.href = "/";
}

checkAccessToken();
const currentUserId = localStorage.getItem("userId");
const targetUserId = 1;
renderMessagesHistory(accessToken, currentUserId, targetUserId);
