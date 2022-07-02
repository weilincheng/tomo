const getUserInfo = async (userId) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
    headers,
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return (window.location = "/");
  }
  const {
    nickname,
    location,
    website,
    profile_image: profileImage,
    background_image: backgroundImage,
    bio,
  } = resultJson;
  const userFollowInfo = await fetch(`/api/v1/user/follow/${userId}`, {
    method: "GET",
  });
  const userFollowInfoJson = await userFollowInfo.json();
  const { following, followers } = userFollowInfoJson;

  return {
    nickname,
    location,
    website,
    profileImage,
    backgroundImage,
    following,
    followers,
    bio,
  };
};

const updateUserInfo = async () => {
  const {
    nickname,
    location,
    website,
    profileImage,
    backgroundImage,
    following,
    followers,
    bio,
  } = await getUserInfo(userId);
  const placeholderImage = "https://via.placeholder.com/80";
  $("#name").text(nickname);
  $("#location").text(location);
  $("#website").attr("href", `https://${website}`).text(website);
  $("#followers-count").text(followers.length);
  $("#following-count").text(following.length);
  if (profileImage) {
    $("#profile-image").attr("src", `${cloudfrontUrl}/${profileImage}`);
  }
  if (backgroundImage) {
    const backgroundImageUrl = `${cloudfrontUrl}/${backgroundImage}`;
    $("#background-image").css(
      "background-image",
      "url(" + backgroundImageUrl + ")"
    );
  }
  $("#bio").text(bio);

  const loggedInUserId = localStorage.getItem("userId");
  updateProfileIconLink(loggedInUserId);
  const blockStatus = await getBlockStatus(userId);
  updateEditFollowBlockButton(userId, loggedInUserId, followers, blockStatus);
  renderUserPosts(
    userId,
    profileImage ? `${cloudfrontUrl}/${profileImage}` : placeholderImage
  );
};

const getBlockStatus = async (targetUserId) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
  const result = await fetch(`/api/v1/user/block/${targetUserId}`, {
    method: "GET",
    headers,
  });
  const resultJson = await result.json();
  return resultJson.currentUserBlockTargetUser;
};

const updateEditFollowBlockButton = (
  profileUserId,
  loggedInUserId,
  profileUserFollowers,
  blockStatus
) => {
  $("#follow-button").hide();
  $("#following-button").hide();
  $("#edit-profile-button").hide();
  $("#block-button").hide();
  $("#blocked-button").hide();
  if (profileUserId === loggedInUserId) {
    $("#edit-profile-button").show();
  } else {
    let isFollowing = false;
    for (let follower of profileUserFollowers) {
      if (parseInt(follower.follower_user_id) === parseInt(loggedInUserId)) {
        isFollowing = true;
      }
    }
    if (isFollowing) {
      $("#following-button").show();
    } else {
      $("#follow-button").show();
    }
    if (blockStatus) {
      $("#blocked-button").show();
    } else {
      $("#block-button").show();
    }
  }
  attachFollowingButtonEvent(profileUserId);
  attachFolloButtonEvent(profileUserId);
  attachBlockedButtonEvent(profileUserId);
  attachBlockButtonEvent(profileUserId);
};

const attachFollowingButtonEvent = (targetUserId) => {
  const followingButton = $("#following-button");
  followingButton.hover(
    () => {
      followingButton.text("Unfollow");
    },
    () => {
      followingButton.text("Following");
    }
  );
  const confirmUnfollowButton = $("#confirm-unfollow-button");
  confirmUnfollowButton.click(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const result = await fetch(`/api/v1/user/follow/${targetUserId}`, {
      method: "DELETE",
      headers,
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
    } else {
      const currentFollowersCount = $("#followers-count").text();
      $("#followers-count").text(parseInt(currentFollowersCount) - 1);
      $("#follow-button").show();
      $("#following-button").hide();
    }
  });
};

const attachFolloButtonEvent = (targetUserId) => {
  const followButton = $("#follow-button");
  followButton.click(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const result = await fetch(`/api/v1/user/follow/${targetUserId}`, {
      method: "POST",
      headers,
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
    } else {
      const currentFollowersCount = $("#followers-count").text();
      $("#followers-count").text(parseInt(currentFollowersCount) + 1);
      $("#follow-button").hide();
      $("#following-button").show();
    }
  });
};

const attachBlockedButtonEvent = (targetUserId) => {
  const blockedButton = $("#blocked-button");
  blockedButton.hover(
    () => {
      blockedButton.text("Unblock");
    },
    () => {
      blockedButton.text("Blocked");
    }
  );
  blockedButton.click(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const result = await fetch(`/api/v1/user/block/${targetUserId}`, {
      method: "DELETE",
      headers,
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
    } else {
      $("#block-button").show();
      $("#blocked-button").hide();
    }
  });
};

const attachBlockButtonEvent = (targetUserId) => {
  const blockButton = $("#confirm-block-button");
  blockButton.click(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const result = await fetch(`/api/v1/user/block/${targetUserId}`, {
      method: "POST",
      headers,
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
    } else {
      $("#block-button").hide();
      $("#blocked-button").show();
    }
  });
};

const renderUserPosts = async (userId, profileImage) => {
  const postsInfo = await getUserPosts(userId);
  for (let i = 0; i < postsInfo.length; i++) {
    const { created_at, images, text, id } = postsInfo[i];
    const date = new Date(created_at);
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const dateString = `${month} ${date.getDate()}`;
    const post = $(
      '<div class="border border-light rounded d-flex w-100 py-2 px-2"></div>'
    );
    const profileImageDiv = $(
      '<div class="col-1 d-flex align-items-start"></div>'
    );
    profileImageDiv.css({
      display: "inline-block",
      width: "100px",
      height: "100px",
      "border-radius": "50%",
      "background-repeat": "no-repeat",
      "background-position": "center center",
      "background-size": "cover",
      "background-image": `url('${profileImage}')`,
    });
    const namePostCol = $(
      '<div class="col-10 d-flex flex-column justify-content-center my-2 px-2"></div>'
    );
    const dateCol = $('<div class="col-1 d-flex align-items-center"></div>');
    const dateConetnt = $('<p class="text-secondary my-0 px-2"></p>').text(
      dateString
    );
    const nickname = $("#name").text();
    const userName = $('<p class="fs-5 my-0 px-2"></p>').text(nickname);
    const postText = $('<p class="fs-6 text-secondary my-0 px-2"></p>').text(
      text
    );
    dateCol.append(dateConetnt);
    namePostCol.append(userName);
    namePostCol.append(postText);
    if (images[0] !== null) {
      const postImagesDiv = $('<div class="row"></div>');
      const postImages = images.map((image) => {
        const imageDiv = $(
          '<div class="col-3 d-flex align-items-start"></div>'
        );
        const imageElement = $('<img class="img-thumbnail img-fluid"></img>');
        imageElement.attr("src", `${cloudfrontUrl}/${image}`);
        imageDiv.append(imageElement);
        return imageDiv;
      });
      for (let image of postImages) {
        postImagesDiv.append(image);
      }
      namePostCol.append(postImagesDiv);
    }
    post.append(profileImageDiv);
    post.append(namePostCol);
    post.append(dateCol);
    $("#posts-section").append(post);
  }
};

const getUserPosts = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}/posts`, {
    method: "GET",
  });
  const resultJson = await result.json();
  return resultJson;
};

const renderFollowList = async (userId, type) => {
  const result = await fetch(`/api/v1/user/follow/${userId}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  const followList = resultJson[type];
  for (let i = 0; i < followList.length; i++) {
    const { follower_user_id, followed_user_id, nickname, profile_image } =
      followList[i];
    const follow = $('<a class="row w-100 mb-2"></a>');
    follow.attr(
      "href",
      `/user/${follower_user_id ? follower_user_id : followed_user_id}`
    );
    const profileImage = $(
      '<div class="col-5 d-flex align-items-center"></div>'
    );
    profileImage.css({
      display: "inline-block",
      width: "100px",
      height: "100px",
      "border-radius": "50%",
      "background-repeat": "no-repeat",
      "background-position": "center center",
      "background-size": "cover",
      "background-image": `url("https://via.placeholder.com/100")`,
    });
    if (profile_image) {
      profileImage.css(
        "background-image",
        `url('${cloudfrontUrl}/${profile_image}')`
      );
    }
    const followInfoCol = $(
      '<div class="col-7 d-flex flex-column justify-content-center my-2"></div>'
    );
    const followName = $('<p class="fs-5 my-0 px-2"></p>').text(nickname);
    followInfoCol.append(followName);
    follow.append(profileImage);
    follow.append(followInfoCol);
    $("#follow-list-details").append(follow);
  }
};

const sendPlaceholderMessage = (
  senderUserId,
  receiverUserId,
  receiverUserName
) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return;
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const body = JSON.stringify({
    type: "placeholder",
    content: `${receiverUserName}-${receiverUserId}`,
  });
  const result = fetch(`/api/v1/message/${senderUserId}/${receiverUserId}`, {
    method: "POST",
    headers,
    body,
  });
  return (window.location = "/messages");
};

const attachClickListeners = () => {
  const followersLink = $("#followers-link");
  const followingLink = $("#following-link");
  const editProfileButton = $("#edit-profile-button");
  const sendMessageLink = $("#send-message-link");
  const blockButton = $("#block-button");
  const loggedInUserId = localStorage.getItem("userId");

  followersLink.click(() => {
    $("#follow-list-details").empty();
    $("#follow-list-section").removeClass("invisible");
    $("#follow-list-title").text("Followers");
    renderFollowList(userId, "followers");
  });
  followingLink.click(() => {
    $("#follow-list-details").empty();
    $("#follow-list-section").removeClass("invisible");
    $("#follow-list-title").text("Following");
    renderFollowList(userId, "following");
  });
  sendMessageLink.click(() => {
    const userName = $("#name").text();
    sendPlaceholderMessage(loggedInUserId, userId, userName);
  });

  editProfileButton.click(() => {
    return (window.location = `/user/edit`);
  });

  blockButton.click(() => {});
};

const userId = $("#profile-script").attr("userId");
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
updateUserInfo();

$(document).ready(() => {
  $("#send-message-link").hide();
  attachClickListeners();
});
