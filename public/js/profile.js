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
  updateUserInfo(name, location, website);
};

const updateUserInfo = async (name, location, website) => {
  $("#name").text(name);
  $("#location").text(location);
  $("#website").attr("href", `https://${website}`).text(website);
};

const renderUserPosts = async (userId) => {
  getUserPosts(userId);
};

const getUserPosts = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}/posts`, {
    method: "GET",
  });
  const resultJson = await result.json();
  console.log(resultJson);
};

const userId = $("#profile-script").attr("userId");

getUserInfo(userId);
renderUserPosts(userId);
