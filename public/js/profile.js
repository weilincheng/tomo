const getUserInfo = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return (window.location = "/");
  }
  const { nickname, location, website } = resultJson;
  const userFollowInfo = await fetch(`/api/v1/user/follow/${userId}`, {
    method: "GET",
  });
  const userFollowInfoJson = await userFollowInfo.json();
  const { following, followers } = userFollowInfoJson;

  return { nickname, location, website, following, followers };
};

const updateUserInfo = async () => {
  const { nickname, location, website, following, followers } =
    await getUserInfo(userId);
  $("#name").text(nickname);
  $("#location").text(location);
  $("#website").attr("href", `https://${website}`).text(website);
  $("#followers-count").text(followers.length);
  $("#following-count").text(following.length);
  const loggedInUserId = localStorage.getItem("userId");
  updateProfileIconLink(loggedInUserId);
  updateEditFollowButton(userId, loggedInUserId, followers);
  renderUserPosts(userId);
};

const updateEditFollowButton = (
  profileUserId,
  loggedInUserId,
  profileUserFollowers
) => {
  $("#follow-button").hide();
  $("#following-button").hide();
  $("#edit-profile-button").hide();
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
  }
  attachFollowingButtonEvent(profileUserId);
  attachFolloButtonEvent(profileUserId);
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

  followingButton.click(async () => {
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

const renderUserPosts = async (userId) => {
  const postsInfo = await getUserPosts(userId);
  for (let i = 0; i < postsInfo.length; i++) {
    const { created_at, title, text, id } = postsInfo[i];
    const date = new Date(created_at);
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const dateString = `${month} ${date.getDate()}`;
    const post = $(
      '<div class="border border-light rounded d-flex w-100 py-2 px-2"></div>'
    );
    const profileImage = $(
      '<div class="col-1 d-flex align-items-center"><img class="rounded-pill img-fluid" src="https://via.placeholder.com/80"></div>'
    );
    const namePostCol = $(
      '<div class="col-10 d-flex flex-column justify-content-center my-2"></div>'
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
    post.append(profileImage);
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

const userId = $("#profile-script").attr("userId");
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
      '<div class="col-3 d-flex align-items-center"><img class="rounded-pill img-fluid" src="https://via.placeholder.com/80"></div>'
    );
    const followInfoCol = $(
      '<div class="col-9 d-flex flex-column justify-content-center my-2"></div>'
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
  const sendMessageLink = $("#send-message-link");
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
};

updateUserInfo();

$(document).ready(() => {
  attachClickListeners();
});
