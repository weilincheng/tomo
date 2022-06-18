const getUserInfo = async () => {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    alert("You are not logged in");
    return (window.location = "/");
  }
  const result = await fetch("/api/v1/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(result.error);
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

getUserInfo();
