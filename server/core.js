const serverless = require("serverless-http");
const fs = require("fs");
const express = require("express");
const app = express();

const getFile = async (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(process.cwd() + "/" + path, "utf-8", (err, data) => {
      if (err) {
        resolve("err");
      } else {
        resolve(data);
      }
    });
  });
};

const Head = async (data) => {
  try {
    let html = await getFile("views/_head.html");
    html = html.replace("[TITLE]", data.title).replace("[DESC]", data.desc);
    return html;
  } catch (e) {}
};

app.get("/", async (req, res) => {
  let data = {
    title: "AGC",
  };
  let contents = "<h1>JANCUK</h1>";
  let head = await Head(data);
  let layout = await getFile("views/layout.html");
  layout = layout.replace("[HEAD]", head).replace("[CONTENTS]", contents);
  res.send(layout);
});

module.exports = app;
module.exports.handler = serverless(app);
