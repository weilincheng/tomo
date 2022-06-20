const getMessages = (accessToken, userId) => {
  const result = fetch(`/api/v1/messages/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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
