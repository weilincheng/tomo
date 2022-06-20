const signUp = async () => {
  const data = {
    name: $("#name").val(),
    email: $("#email").val(),
    password: $("#password").val(),
    location: $("#location").val(),
    website: $("#website").val(),
  };
  const result = await fetch("/api/v1/user/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return result;
};

$("#signup-button").click(async (event) => {
  event.preventDefault();
  const result = await signUp();
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return;
  }
  const { access_token } = resultJson;
  localStorage.setItem("accessToken", access_token);
  return (window.location = "/");
});
