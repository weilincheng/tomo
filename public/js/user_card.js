const createUserCard = (socketId) => {
  const card = $('<div class="card mb-3" style="max-width: 540px;">');
  card.attr("id", `user-card-${socketId}`);
  const cardRow = $('<div class="row g-0">');
  const cardColImage = $('<div class="col-md-4">');
  cardColImage.css({
    display: "inline-block",
    width: "100px",
    height: "100px",
    "border-radius": "50%",
    "background-repeat": "no-repeat",
    "background-position": "center center",
    "background-size": "cover",
    "background-image": `url("https://via.placeholder.com/100")`,
  });
  // const cardImage = $(
  //   '<img class="img-fluid rounded-circle px-1 py-1" src="https://via.placeholder.com/150" alt="Card image">'
  // );
  // cardImage.attr("id", `card-image-${socketId}`);
  cardColImage.attr("id", `card-image-${socketId}`);
  // cardColImage.append(cardImage);
  cardRow.append(cardColImage);
  const cardColBody = $('<div class="col-md-8">');
  const cardBody = $('<div class="card-body">');
  const cardTitle = $('<h5 class="card-title"></h5>');
  cardTitle.attr("id", `card-title-${socketId}`);
  cardBody.append(cardTitle);
  const cardText = $('<p class="card-text fs-6 fw-light text-secondary"></p>');
  cardText.attr("id", `card-text-${socketId}`);
  cardBody.append(cardText);
  cardColBody.append(cardBody);
  cardRow.append(cardColBody);
  card.append(cardRow);
  return card;
};

const appendUserCard = (card) => {
  $("#right-col").append(card);
};

const updateCardTitleText = (
  socketId,
  name,
  location,
  website,
  profileImage
) => {
  $("#card-title-" + socketId).text(name ? name : "annonymous");
  $("#card-text-" + socketId).text(`${location ? location : ""}`);
  if (profileImage) {
    // $("#card-image-" + socketId).attr(
    //   "src",
    //   `${cloudfrontUrl}/${profileImage}`
    // );
    $("#card-image-" + socketId).css(
      "background-image",
      `url('${cloudfrontUrl}/${profileImage}')`
    );
  }
};

const appendRightColTitle = (name) => {
  const title = $('<p class="fs-3"></p>');
  title.text(`Welcome, ${name}!`);
  const text = $('<p class="fs-6"></p>');
  text.text(`Let's see who is nearby!`);
  $("#right-col").append(title);
  $("#right-col").append(text);
};

const removeUserCard = (socketId) => {
  $(`#user-card-${socketId}`).remove();
};

const updateUserCardLink = (socketId, userId) => {
  if (userId) {
    $("#card-title-" + socketId).wrap(
      `<a href="/user/${userId}" target="_blank" rel="noopener noreferrer"></a>`
    );
  }
};

const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
