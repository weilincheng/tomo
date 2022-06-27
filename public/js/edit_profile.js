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
  $("#nickname-current").text(nickname.length);
  $("#bio").val(bio);
  $("#bio-current").text(bio.length);
  $("#location").val(location);
  $("#location-current").text(location.length);
  $("#website").val(website);
  $("#website-current").text(website.length);
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
  alert(resultJson.status);
  window.location = `/user/${userId}`;
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
  $("#cancel-button").click(() => {
    window.location = `/user/${localStorage.getItem("userId")}`;
  });
};

const attachTypeEvent = () => {
  $("#nickname").keyup(() => {
    let characterCount = $("#nickname").val().length,
      current = $("#nickname-current");
    current.text(characterCount);
  });
  $("#bio").keyup(() => {
    let characterCount = $("#bio").val().length,
      current = $("#bio-current");
    current.text(characterCount);
  });
  $("#location").keyup(() => {
    let characterCount = $("#location").val().length,
      current = $("#location-current");
    current.text(characterCount);
  });
  $("#website").keyup(() => {
    let characterCount = $("#website").val().length,
      current = $("#website-current");
    current.text(characterCount);
  });
};

renderUserProfile();

$(() => {
  attachClickEvent();
  attachTypeEvent();
});
