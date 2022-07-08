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
  } else {
    alert("Please login first!");
    window.location = "/";
  }
};

const getNotifications = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const result = await fetch("/api/v1/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
    }
    return resultJson;
  }
};

const renderNotifications = async () => {
  const notifications = await getNotifications();
  const notificationSection = $("#notifications-section");
  for (const notification of notifications) {
    const {
      profile_image: profileImage,
      sender_nickname: nickname,
      content,
      id,
      type,
      has_read: hasRead,
      created_at: createdAt,
    } = notification;
    const date = new Date(createdAt);
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const dateString = `${month} ${date.getDate()}`;
    const notificationCard = $(
      '<div class="ps-4 notification-card row border-bottom py-4 d-flex justify-content-between align-items-center">'
    );
    if (!hasRead) {
      notificationCard.css("background-color", "#79DAE8");
    }
    const notificationLeftColumn = $('<div class="col-1">');
    const notificationMiddleColumn = $('<div class="col-10 pe-3">');
    const notificationRightColumn = $('<div class="col-1">');
    const profileImageDiv = $('<div class="col-2 d-flex "></div>');
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
    if (profileImage) {
      if (profileImage.slice(0, 5) === "https") {
        profileImageDiv.css("background-image", `url(${profileImage})`);
      } else {
        profileImageDiv.css(
          "background-image",
          `url('${cloudfrontUrl}/${profileImage}')`
        );
      }
    }
    const notificationDateConetnt = $(
      '<p class="text-secondary my-0 px-2"></p>'
    ).text(dateString);
    const notificationSummary = $('<div class="fs-5"></div>');
    if (type === "follow") {
      notificationSummary.text(`${nickname} followed you`);
    } else if (type === "post") {
      notificationSummary.text(`${nickname} published a new post`);
    } else if (type === "message") {
      notificationSummary.text(
        `Congratulations! You can send private message to ${nickname} now`
      );
      notificationSummary.css("white-space", "pre-line");
    }
    const notificationContent = $('<div class="fs-6 text-secondary"></div>');
    notificationContent.text(content);
    notificationLeftColumn.append(profileImageDiv);
    notificationMiddleColumn.append(notificationSummary);
    notificationMiddleColumn.append(notificationContent);
    notificationRightColumn.append(notificationDateConetnt);
    notificationCard.append(notificationLeftColumn);
    notificationCard.append(notificationMiddleColumn);
    notificationCard.append(notificationRightColumn);
    notificationSection.append(notificationCard);
  }
};

checkAccessToken();
const currentUserId = parseInt(localStorage.getItem("userId"));
renderNotifications(currentUserId);
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
