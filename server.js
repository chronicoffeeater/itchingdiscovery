const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("sync-fetch");
const fs = require("fs");

let tagsPrimary = require("./tags.js").tags[0];
let tagsSecondary = require("./tags.js").tags[1];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load projects from the file
let projects = [];
console.log(fs.readFileSync("projects.json", "utf8"));
if (fs.existsSync("projects.json")) {
  projects = JSON.parse(fs.readFileSync("projects.json", "utf8")).list;
}

// CACHE
const apicache = require("apicache");
let cache = apicache.middleware;

// everything else
app.set("view engine", "ejs");

app.get("/", cache("5 minutes"), async function (req, res) {
  let recent = projects.slice(-4).reverse();
  
  for (let i = 0; i < recent.length; i++) {
    let a = recent[i];
    let APIdata = await fetch(
      "https://api.scratch.mit.edu/projects/" + a.id
    ).json();
    a.title = APIdata.title;
    a.author = APIdata.author.username;
  }

  res.render("index", { recent });
});

app.get("/add", (req, res) => {
  res.render("add", { tagsPrimary, tagsSecondary });
});

app.post("/add", (req, res) => {
  const projectLink = req.body.projectLink;
  const tagOne = req.body.tag1;
  const tagTwo = req.body.tag2;

  if (!tagsPrimary.includes(tagOne) || !tagsSecondary.includes(tagTwo)) {
    return res.send("Selected tags don't match the server array(s).");
  }

  let validateResult = validateProject(projectLink);

  if (validateResult == 4) {
    const projectId = projectLink.split("/")[4];
    const projectData = {
      id: projectId,
      link: projectLink,
      tags: [tagOne, tagTwo],
    };
    projects.push(projectData);
    fs.writeFileSync(
      "projects.json",
      JSON.stringify({ list: projects }, null, 2)
    );

    apicache.clear("/");
    res.redirect("/");
  } else {
    if (validateResult == 1)
      return res.render("rejected.ejs", { err: "the URL is not valid." });
    if (validateResult == 2)
      return res.render("rejected.ejs", {
        err: "it does not exist / unshared.",
      });
    if (validateResult == 3)
      return res.render("rejected.ejs", {
        err: "it is already registered in the database.",
      });
    if (validateResult == 5)
      return res.render("rejected.ejs", {
        err: "it is too popular. This website is meant to help smaller ones grow!",
      });
    if (validateResult == 6)
      return res.render("rejected.ejs", {
        err: "it must be shared for more than two days.",
      });

    res.render("error.ejs", {
      err: "Unknown Reason. Comment on @i_eat_coffee's profile for info.",
    });
  }
});

function validateProject(projStr) {
  if (
    projStr.startsWith("https://scratch.mit.edu/projects/") &&
    /^\d{6,11}$/.test(projStr.split("/")[4])
  ) {
    let x = fetch("https://api." + projStr.slice(8)).json();
    if (x.code == "NotFound") {
      return 2;
    }

    if (
      (new Date().getTime() - new Date(x.history.shared).getTime()) /
        1000 /
        60 /
        60 /
        24 <
      2
    ) {
      return 6;
    }

    if (projects.some((project) => project.id === projStr.split("/")[4]))
      return 3;
    if (x.stats.views > 1000) return 5;
    return 4;
  } else {
    return 1;
  }
}

// 404
app.get("/*", function (req, res) {
  res.status(404).render("404");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
