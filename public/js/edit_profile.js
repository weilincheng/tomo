const verifyToken = async (accessToken) => {
  const result = await fetch("/api/v1/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    localStorage.clear();
    return;
  }
  return resultJson;
};

const getUserInfo = async (userId) => {
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return (window.location = "/");
  }
  const {
    nickname,
    bio,
    location,
    website,
    profile_image: profileImage,
    background_image: backgroundImage,
  } = resultJson;
  return { nickname, bio, location, website, profileImage, backgroundImage };
};

const renderUserProfile = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("Please sign in first");
    return (window.location = "/");
  }
  await verifyToken(accessToken);
  const userId = localStorage.getItem("userId");
  updateProfileIconLink(userId);
  const { nickname, location, website, bio, profileImage, backgroundImage } =
    await getUserInfo(userId);
  const cloudFrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
  $("#nickname").val(nickname);
  $("#bio").val(bio);
  $("#location").val(location);
  $("#website").val(website);
  $("#profile-image-source").attr(
    "src",
    profileImage
      ? `${cloudFrontUrl}/${profileImage}`
      : "https://via.placeholder.com/100"
  );
  $("#background-image-source").attr(
    "src",
    backgroundImage
      ? `${cloudFrontUrl}/${backgroundImage}`
      : "https://via.placeholder.com/100"
  );
};

const sendPutFormData = async (formData) => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const resultJson = await result.json();
  alert(resultJson);
};

const attachClickEvent = () => {
  $("#profile-image").on("change", (evt) => {
    const [file] = evt.target.files;
    if (file) {
      $("#profile-image-source").attr("src", URL.createObjectURL(file));
    }
  });
  $("#background-image").on("change", (evt) => {
    const [file] = evt.target.files;
    if (file) {
      $("#background-image-source").attr("src", URL.createObjectURL(file));
    }
  });
  $("#save-button").click(() => {
    const formData = new FormData(document.getElementById("profile-form"));
    sendPutFormData(formData);
  });
};

renderUserProfile();

$(() => {
  attachClickEvent();
});