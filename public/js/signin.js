const signIn = async () => {
  const data = {
    provider: "native",
    email: $("#email").val(),
    password: $("#password").val(),
  };
  const result = await fetch("/api/v1/user/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return result;
};

$("#signin-button").click(async (event) => {
  event.preventDefault();
  if ($("#email").val().trim() === "" || $("#password").val().trim() === "") {
    $("#alertModalToggleLabel").text("Email or Password is empty");
    $("#alertModalToggle").modal("show");
    return;
  }
  const result = await signIn();
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return;
  }
  const { accessToken } = resultJson;
  localStorage.setItem("accessToken", accessToken);
  return (window.location = "/map");
});

$(".nav-item").click((event) => {
  event.preventDefault();
  $(".nav-item").attr("data-bs-target", "#alertModalToggle");
  $(".nav-item").attr("data-bs-toggle", "modal");
  $("#alertModalToggleLabel").text("Please sign in first!");
  $("#alertModalToggle").modal("show");
});
