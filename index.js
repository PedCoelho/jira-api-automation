/* -------------------------------------------------------------------------- */
/*                                Dotenv setup                                */
/* -------------------------------------------------------------------------- */
const dotenv = require("dotenv");
dotenv.config();

/* -------------------------------------------------------------------------- */
/*                                 Axios setup                                */
/* -------------------------------------------------------------------------- */
const axios = require("axios");
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

/* -------------------------------------------------------------------------- */
/*                             Actual application                             */
/* -------------------------------------------------------------------------- */
const jiraUtils = require("./utilities.js");

(async () => {
  let data = await jiraUtils.getProjects().catch((e) => {
    console.error(e);
  });

  console.log(data);
})();

// (async () => {
//   let data = await jiraUtils.getReport("PAND").catch((e) => {
//     console.error(e);
//   });

//   console.log(data);
// })();
