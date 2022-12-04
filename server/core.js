const serverless = require("serverless-http");
const { getImages, getSentences } = require("./api");
const { getFile, validStr, ucwords } = require("./utils");
const express = require("express");

const app = express();
app.use("/assets", express.static("assets"));

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

app.get("/cdn/:query.png", async (req, res) => {
  let query = await req.params;
  res.send(query);
});

app.get("/:query", async (req, res) => {
  let query = await req.params.query;
  query = await validStr(query);

  let img = await getImages(query);
  let sentences = await getSentences(query);
  res.write(
    `<h1>${ucwords(query)}</h1>\n<img src="${
      img[Math.floor(Math.random() * img.length)]["image"]
    }" width="100%" />\n<p>${
      sentences[Math.floor(Math.random() * sentences.length)]
    }</p>`
  );
  res.send();
});

module.exports = app;
module.exports.handler = serverless(app);
