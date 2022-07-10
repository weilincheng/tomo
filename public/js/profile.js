const getUserInfo = async (userId) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const blockStatusResult = await fetch(`/api/v1/user/block/${userId}`, {
    method: "GET",
    headers,
  });
  const blockStatusJson = await blockStatusResult.json();
  const blocked = blockStatusJson.targetUserBlockCurrentUser;
  if (blocked) {
    $("#alertModalToggleLabel").text("You are blocked by this user");
    $("#alertModalToggle").modal("show");
    $("#alertModalUnderstandButton").click(() => {
      return;
    });
  }

  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
    headers,
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    $("#alertModalToggleLabel").text(resultJson.error);
    $("#alertModalToggle").modal("show");
    return (window.location = "/");
  }
  const {
    nickname,
    location,
    website,
    profile_image: profileImage,
    background_image: backgroundImage,
    bio,
    interests,
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
    interests,
    blocked,
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
    interests,
    blocked,
  } = await getUserInfo(userId);
  if (blocked) {
    return;
  }
  $("#profile-center-column").removeClass("invisible");
  const placeholderImage = "https://via.placeholder.com/80";
  $("#name").text(nickname);
  $("#location").text(location);
  $("#website").attr("href", `https://${website}`).text(website);
  $("#followers-count").text(followers.length);
  $("#following-count").text(following.length);
  if (interests.length > 0 && interests[0] !== null) {
    $("#interests-icon").removeClass("invisible");
    for (const interest of interests) {
      const interestElement = $(
        `<span class="ms-1 badge rounded-pill text-bg-primary">${interest}</span>`
      );
      $("#interests-list").append(interestElement);
    }
  }
  if (profileImage) {
    if (profileImage.includes("http")) {
      $("#profile-image").attr("src", profileImage);
    } else {
      $("#profile-image").attr("src", `${cloudfrontUrl}/${profileImage}`);
    }
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
  renderPosts(userId, profileImage ? profileImage : placeholderImage);
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
    $("#confirmUnfollowModal").modal("hide");
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const result = await fetch(`/api/v1/user/follow/${targetUserId}`, {
      method: "DELETE",
      headers,
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      $("#alertModalToggleLabel").text(resultJson.error);
      $("#alertModalToggle").modal("show");
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
      $("#alertModalToggleLabel").text(resultJson.error);
      $("#alertModalToggle").modal("show");
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
      $("#alertModalToggleLabel").text(resultJson.error);
      $("#alertModalToggle").modal("show");
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
      $("#alertModalToggleLabel").text(resultJson.error);
      $("#alertModalToggle").modal("show");
    } else {
      $("#block-button").hide();
      $("#blocked-button").show();
    }
  });
};

const renderPosts = async (userId, profileImage) => {
  const postsInfo = await getUserPosts(userId);
  for (let i = 0; i < postsInfo.length; i++) {
    const { created_at, images, text, id } = postsInfo[i];
    const date = new Date(created_at);
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("en-US", options).format(date);
    const dateString = `${month} ${date.getDate()}`;
    const post = $(
      '<div class="border border-light rounded d-flex w-100 py-2 px-2 align-items-center"></div>'
    );
    post.attr("id", `post-div-${id}`);
    const profileImageDiv = $('<div class="col-1 "></div>');
    if (profileImage.includes("http")) {
      profileImageDiv.css({
        "background-image": `url('${profileImage}')`,
      });
    } else {
      profileImageDiv.css({
        "background-image": `url('${cloudfrontUrl}/${profileImage}')`,
      });
    }
    profileImageDiv.css({
      display: "inline-block",
      width: "50px",
      height: "50px",
      "border-radius": "50%",
      "background-repeat": "no-repeat",
      "background-position": "center center",
      "background-size": "cover",
    });
    const namePostCol = $(
      '<div class="col-11 d-flex flex-column justify-content-center my-2 px-2"></div>'
    );
    const deleteDropdownCol = $(
      '<div class="col-auto dropdown d-flex justify-content-center align-self-start"></div>'
    );
    const dropdownButton = $(
      '<button class="btn btn-sm dropdown-toggle dropdown-toggle-button" type="button"  data-bs-toggle="dropdown" aria-expanded="false"></button>'
    );
    const dropdownMenu = $(
      '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton1">'
    );
    const dropdownItem = $(
      ' <li> <button class="btn-danger dropdown-item delete-button" data-bs-toggle="modal" data-bs-target="#confirmDeletePostModal" > Delete </button> </li> '
    );
    dropdownItem.children().attr("id", `dropdown-item-post-id-${id}`);
    dropdownItem.children().click(() => {
      $("#confirm-delete-post-button").attr("post-id", id);
    });
    dropdownMenu.append(dropdownItem);
    deleteDropdownCol.append(dropdownButton);
    deleteDropdownCol.append(dropdownMenu);
    const dateContent = $('<p class="fs-6 text-secondary my-0 px-2"></p>').text(
      dateString
    );
    const nickname = $("#name").text();
    const nameDateDiv = $('<div class="d-flex align-items-center"></div>');
    const userName = $('<p class="fs-5 my-0 px-2"></p>').text(nickname);
    nameDateDiv.append(userName);
    nameDateDiv.append(dateContent);
    const postText = $('<p class="fs-6 text-secondary my-0 px-2"></p>').text(
      text
    );
    namePostCol.append(nameDateDiv);
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
    post.append(deleteDropdownCol);
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
    const follow = $(
      '<div class="rounded-pill row w-100 mb-2 px-3 py-3 follow-card"></div>'
    );
    const profileImage = $(
      '<div class="col-5 d-flex align-items-center"></div>'
    );
    profileImage.css({
      display: "inline-block",
      width: "50px",
      height: "50px",
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
    const followNameLink = $(
      `<a class="fs-5 my-0 px-2 text-decoration-none" style="color: #0773f4;" href="/user/${
        follower_user_id ? follower_user_id : followed_user_id
      }" target="_blank" ></a>`
    ).text(nickname);
    followInfoCol.append(followNameLink);
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
  const loggedInUserId = localStorage.getItem("userId");

  const deletePostButton = $("#confirm-delete-post-button");

  followersLink.click(() => {
    $("#follow-list-details").empty();
    $("#follow-list-offcanvas-title").text("Followers");
    renderFollowList(userId, "followers");
  });
  followingLink.click(() => {
    $("#follow-list-details").empty();
    $("#follow-list-offcanvas-title").text("Following");
    renderFollowList(userId, "following");
  });
  sendMessageLink.click(() => {
    const userName = $("#name").text();
    sendPlaceholderMessage(loggedInUserId, userId, userName);
  });

  editProfileButton.click(() => {
    return (window.location = `/user/edit`);
  });

  deletePostButton.click(async () => {
    $("#onfirmDeletePostModal").modal("hide");
    const postId = $("#confirm-delete-post-button").attr("post-id");
    const accessToken = localStorage.getItem("accessToken");
    const result = await fetch(
      `/api/v1/user/${loggedInUserId}/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const resultJson = await result.json();
    $("#alertModalToggleLabel").text(resultJson.status);
    $("#alertModalToggle").modal("show");
    $(`#post-div-${postId}`).remove();
  });
};

const userId = $("#profile-script").attr("userId");
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
updateUserInfo();

$(document).ready(() => {
  $("#send-message-link").hide();
  attachClickListeners();
});
