const checkAccessToken = async (accessToken) => {
  if (accessToken) {
    const result = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      $("#alertModalToggleLabel").text(resultJson.error);
      $("#alertModalToggle").modal("show");
      localStorage.clear();
      $("#alertModalUnderstandButton").click(() => {
        window.location = "/signin";
      });
      return;
    }
    const userInfo = await fetch(`/api/v1/user/${resultJson.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userInfoJson = await userInfo.json();
    const {
      nickname,
      location,
      website,
      id,
      bio,
      profile_image: profileImage,
    } = userInfoJson;
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    localStorage.setItem("bio", bio);
    localStorage.setItem("profileImage", profileImage);
    $(() => {
      $("#main-content").removeClass("invisible");
      updateProfileIconLink(id);
    });
  } else {
    $(() => {
      $("#alertModalToggleLabel").text("Please sign in or sign up first");
      $("#alertModalToggle").modal("show");
      localStorage.clear();
      $("#alertModalUnderstandButton").click(() => {
        window.location = "/signin";
      });
      return;
    });
  }
};

const accessToken = localStorage.getItem("accessToken");
checkAccessToken(accessToken);
