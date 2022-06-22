$("#nav-signout-link").on("click", () => {
  localStorage.clear();
});

const updateProfileIconLink = (userId) => {
  $("#nav-profile-link").attr("href", `/user/${userId}`);
};
