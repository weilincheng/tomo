const getUserInfo = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    console.log(resultJson.error);
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

const userId = $("#profile-script").attr("userId");

getUserInfo(userId);
