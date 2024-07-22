const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
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
  let recent = projects.slice(-5).reverse();
  let games = projects
    .filter((proj) => proj.tags[0] == "games")
    .slice(-5)
    .reverse();
  let music = projects
    .filter((proj) => proj.tags[0] == "music")
    .slice(-5)
    .reverse();

  for (let i = 0; i < recent.length; i++) {
    let a = recent[i];
    let response = await fetch("https://api.scratch.mit.edu/projects/" + a.id);
    let APIdata = await response.json();

    if (a.code == 'NotFound') {
      /* delete the project from db
      fs.writeFileSync(
        "projects.json",
        JSON.stringify({ list: projects }, null, 2)
      );
      apicache.clear('/');
      return res.send(`<script>window.location.reload();</script>`); */
      continue;
    }
    a.title = APIdata.title;
    a.author = APIdata.author.username;
    a.pfp = APIdata.author.profile.images["90x90"];
  }

  for (let i = 0; i < games.length; i++) {
    let b = games[i];
    let response = await fetch("https://api.scratch.mit.edu/projects/" + b.id);
    let APIdata = await response.json();
    if (b.code == 'NotFound') {
      /* delete the project from db
      fs.writeFileSync(
        "projects.json",
        JSON.stringify({ list: projects }, null, 2)
      );
      apicache.clear('/');
      return res.send(`<script>window.location.reload();</script>`); */
      continue;
    }
    b.title = APIdata.title;
    b.author = APIdata.author.username;
    b.pfp = APIdata.author.profile.images["90x90"];
  }

  for (let i = 0; i < music.length; i++) {
    let c = music[i];
    let response = await fetch("https://api.scratch.mit.edu/projects/" + c.id);
    let APIdata = await response.json();
    if (c.code == 'NotFound') {
      /* delete the project from db
      fs.writeFileSync(
        "projects.json",
        JSON.stringify({ list: projects }, null, 2)
      );
      apicache.clear('/');
      return res.send(`<script>window.location.reload();</script>`); */
      continue;
    }
    c.title = APIdata.title;
    c.author = APIdata.author.username;
    c.pfp = APIdata.author.profile.images["90x90"];
  }

  res.render("index", { recent, games, music });
});

app.get("/add", (req, res) => {
  res.render("add", { tagsPrimary, tagsSecondary });
});

app.post("/admintest", function (req, res) {
  if (req.body.admin == process.env.admin) { return { admin: true } }else{ return { admin: false } }
});

app.post("/search", async function (req, res) {
  res.send(await search(req.query.type, req.query.q));
});

app.post("/add", async function (req, res) {
  const projectLink = req.body.projectLink;
  const tagOne = req.body.tag1;
  const tagTwo = req.body.tag2;

  if (!tagsPrimary.includes(tagOne) || !tagsSecondary.includes(tagTwo)) {
    return res.send("Selected tags don't match the server array(s).");
  }

  let validateResult = await validateProject(projectLink);

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
    if (validateResult == 7)
      return res.render("rejected.ejs", {
        err: "the minimum view count is 10 (in order to prevent abuse).",
      });

    res.render("error.ejs", {
      err: "Unknown Reason. Comment on @i_eat_coffee's profile for info.",
    });
  }
});

async function validateProject(projStr) {
  if (
    projStr.startsWith("https://scratch.mit.edu/projects/") &&
    /^\d{6,11}$/.test(projStr.split("/")[4])
  ) {
    let response = await fetch("https://api." + projStr.slice(8));
    let x = await response.json();
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

    if (x.stats.views < 10) {
      return 7;
    }

    if (projects.some((project) => project.id === projStr.split("/")[4]))
      return 3;
    if (x.stats.views > 1000) return 5;
    return 4;
  } else {
    return 1;
  }
}

async function search(type, query) {
  let queryMatch = [];
  
  if (type == '1') {
    for (let i = 0; i < projects.length; i++) {
      let a = projects[i];
      let response = await fetch("https://api.scratch.mit.edu/projects/" + a.id);
      let APIdata = await response.json();

      if (a.title.includes(query)) {
        a.title = APIdata.title;
        a.author = APIdata.author.username;
        a.pfp = APIdata.author.profile.images["90x90"];

        queryMatch.unshift(a);
      }
    }
    
    return {error: false, queryMatch}
  }else if (type == '2') {
    queryMatch = projects.filter(a => a.tags.includes(query));
    
    return {error: false, queryMatch}
  }else{
    return {error: 'Invalid search type!', queryMatch}
  }
}

// 404
app.get("/*", function (req, res) {
  res.status(404).render("404");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
