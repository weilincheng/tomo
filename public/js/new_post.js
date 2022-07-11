const verifyToken = async (accessToken) => {
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
    for (const file of files) {
      if (file.size > 1000000) {
        $("#alertModalToggleLabel").text(
          "File size is too large. Max size is 1MB."
        );
        $("#alertModalToggle").modal("show");
        $("#post-images").prop("value", "");
        return;
      }
    }
    if (files.length > 4) {
      $("#alertModalToggleLabel").text(
        "You can only upload a maximum of 4 files"
      );
      $("#alertModalToggle").modal("show");
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
      $("#alertModalToggleLabel").text("Please enter some content");
      $("#alertModalToggle").modal("show");
      return;
    }
    const formData = new FormData(document.getElementById("post-form"));
    sendPostFormData(formData);
  });
};

const sendPostFormData = async (formData) => {
  $("#newPostModal").modal("hide");
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
  $("#alertModalToggleLabel").text(resultJson.status);
  $("#alertModalToggle").modal("show");
};

const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  verifyToken(localStorage.getItem("accessToken"));
} else {
  $("#alertModalToggleLabel").text("Please log in first!");
  $("#alertModalToggle").modal("show");
  window.location = "/";
}

$(() => {
  const userId = localStorage.getItem("userId");
  updateProfileIconLink(userId);
  attachTypeEvent();
  attachImageEvent();
  attachPostEvent();
});
