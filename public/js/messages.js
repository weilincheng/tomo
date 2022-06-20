const getMessages = async (accessToken, userId) => {
  const result = await fetch(`/api/v1/message/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  console.log(resultJson);
  for (let i = 0; i < resultJson.length; i++) {
    const {
      sender_user_id,
      receiver_user_id,
      created_at,
      type,
      content,
    } = resultJson[i];
    createMessage(sender_user_id, receiver_user_id, created_at, type, content);
};

const accessToken = localStorage.getItem("accessToken");
const userId = localStorage.getItem("userId");

const checkAccessToken = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const result = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(result.error);
      return (window.location = "/");
    }
    const { name, location, website, id } = resultJson;
    localStorage.setItem("name", name);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    updateProfileIconLink(id);
  }
};

if (!accessToken) {
  alert("Please sign in!");
  window.location.href = "/";
}

checkAccessToken();
getMessages(accessToken, userId);
