const verifyToken = async (accessToken) => {
  const result = await fetch("/api/v1/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert("resultJson.error");
    localStorage.clear();
    window.location = "/";
  }
  return resultJson;
};

const attachTypeEvent = () => {
  $("#post-content").keyup(() => {
    let characterCount = $("#post-content").val().length,
      current = $("#current");
    current.text(characterCount);
  });
};

const attachImageEvent = () => {
  const postImagesContainer = $("#post-images-container");
  $("#post-images").on("change", (evt) => {
    postImagesContainer.empty();
    $("#post-button").attr("disabled", false);
    const files = evt.target.files;
    if (files.length > 4) {
      alert("You can only upload a maximum of 4 files");
      $("#post-button").attr("disabled", true);
      return;
    }
    for (const file of files) {
      const image = $('<img class="w-25">');
      image.attr("src", URL.createObjectURL(file));
      postImagesContainer.append(image);
    }
  });
};

const attachPostEvent = () => {
  $("#post-button").click(() => {
    if ($("#post-content").val().length === 0) {
      alert("Please enter some content");
      return;
    }
    const formData = new FormData(document.getElementById("post-form"));
    sendPostFormData(formData);
  });
};

const attachCancelEvent = () => {
  $("#cancel-button").click(() => {
    window.location = `/user/${localStorage.getItem("userId")}`;
  });
};

const sendPostFormData = async (formData) => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const result = await fetch(`/api/v1/user/${userId}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const resultJson = await result.json();
  alert(resultJson.status);
  window.location = `/user/${userId}`;
};

const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  verifyToken(localStorage.getItem("accessToken"));
} else {
  alert("Please log in first!");
  window.location = "/";
}
const userId = localStorage.getItem("userId");

$(() => {
  updateProfileIconLink(userId);
  attachTypeEvent();
  attachImageEvent();
  attachPostEvent();
  attachCancelEvent();
});
