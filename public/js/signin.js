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
  const result = await signIn();
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return;
  }
  const { access_token } = resultJson;
  localStorage.setItem("accessToken", access_token);
  return (window.location = "/");
});
