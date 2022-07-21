const MAX_FILE_SIZE = 1000000;
const MAX_FILE_COUNT = 4;
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
      if (file.size > MAX_FILE_SIZE) {
        $("#alertModalToggleLabel").text(
          "File size is too large. Max size is 1MB."
        );
        $("#alertModalToggle").modal("show");
        $("#post-images").prop("value", "");
        return;
      }
    }
    if (files.length > MAX_FILE_COUNT) {
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
  $("#post-button").click(async () => {
    if ($("#post-content").val().trim().length === 0) {
      $("#alertModalToggleLabel").text("Please enter some content");
      $("#alertModalToggle").modal("show");
      return;
    }
    const formData = new FormData(document.getElementById("post-form"));
    const loggedInUserId = localStorage.getItem("userId");
    const currentUserId = $("#profile-script").attr("userId");
    await sendPostFormData(formData);
    $("#post-content").val("");
    $("#newPostModal").modal("hide");
    if (loggedInUserId && currentUserId) {
      if (loggedInUserId === currentUserId) {
        $("#alertModalUnderstandButton").click(() => {
          window.location.reload();
        });
      }
    }
  });
};

const sendPostFormData = async (formData) => {
  $("#newPostModal").modal("hide");
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

$(() => {
  const userId = localStorage.getItem("userId");
  updateProfileIconLink(userId);
  attachTypeEvent();
  attachImageEvent();
  attachPostEvent();
});
