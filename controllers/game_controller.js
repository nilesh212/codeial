module.exports.gameName = function (request, response) {
  return response.render("games", {
    title: "Games",
  });
};
