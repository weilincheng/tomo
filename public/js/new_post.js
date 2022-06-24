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

// const attachClickEvent = () => {};
const attachTypeEvent = () => {
  $("#post-content").keyup(() => {
    let characterCount = $("#post-content").val().length,
      current = $("#current");
    current.text(characterCount);
  });
};

verifyToken(localStorage.getItem("accessToken"));
const userId = localStorage.getItem("userId");
// updateProfileIconLink(userId);

$(() => {
  attachTypeEvent();
  // attachClickEvent();
});
