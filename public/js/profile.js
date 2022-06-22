const getUserInfo = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return (window.location = "/");
  }
  const { name, location, website } = resultJson;
  const userFollowInfo = await fetch(`/api/v1/user/follow/${userId}`, {
    method: "GET",
  });
  const userFollowInfoJson = await userFollowInfo.json();
  const { following, followers } = userFollowInfoJson;

  return { name, location, website, following, followers };
};

const updateUserInfo = async () => {
  const { name, location, website, following, followers } = await getUserInfo(
    userId
  );
  $("#name").text(name);
  $("#location").text(location);
  $("#website").attr("href", `https://${website}`).text(website);
  $("#followers-count").text(followers.length);
  $("#following-count").text(following.length);
  const loggedInUserId = localStorage.getItem("userId");
  updateProfileIconLink(loggedInUserId);
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
    const name = $("#name").text();
    const userName = $('<p class="fs-5 my-0 px-2"></p>').text(`${name}`);
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
    const { follower_user_id, followed_user_id, name, profile_image } =
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
    const followName = $('<p class="fs-5 my-0 px-2"></p>').text(name);
    followInfoCol.append(followName);
    follow.append(profileImage);
    follow.append(followInfoCol);
    $("#follow-list-details").append(follow);
  }
};
const attachClickListeners = () => {
  const followersLink = $("#followers-link");
  const followingLink = $("#following-link");
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
};

updateUserInfo();
renderUserPosts(userId);
$(document).ready(() => {
  attachClickListeners();
});
