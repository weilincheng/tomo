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

$("#signin-button").click(async () => {
  $("#signin-button").attr("disabled", true);
  const result = await signIn();
  const resultJson = await result.json();
  const { access_token } = resultJson;
  localStorage.setItem("access_token", access_token);
  return (location = "/profile");
});
