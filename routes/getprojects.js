var express = require("express");
var router = express.Router();
/* -------------------------- application utilities ------------------------- */
const jiraUtils = require("../utilities.js");

/* GET users listing. */
router.get("/", function (req, res, next) {
  jiraUtils
    .getProjects()
    .then((response) => {
      if (Object.keys(response)) {
        res.send(response);
      } else {
        res.status(400).send("Sem dados para exibir");
      }
    })
    .catch((e) => res.status(400).send(e.message));
});

module.exports = router;
