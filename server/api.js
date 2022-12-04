const { url, max_iter, max_retries } = require("./constants");
const { getToken, sleep, curlContent } = require("./utils");
const NC = require("node-cache");
const Cache = new NC({ checkperiod: 0 });

const getImages = async (query, moderate, retries, iterations) => {
  let reqUrl = url + "i.js?";
  let keywords = query;
  let p = moderate ? 1 : -1; // by default moderate false
  let attempt = 0;
  if (!retries) retries = max_retries; // default to max if none provided
  if (!iterations) iterations = max_iter; // default to max if none provided

  let results = [];

  try {
    let dataCache = Cache.get("images::" + keywords);
    if (dataCache == undefined) {
      let token = await getToken(keywords);

      let params = new URLSearchParams({
        l: "wt-wt",
        o: "json",
        q: keywords,
        vqd: token,
        f: ",,,",
        p: "" + p,
      }).toString();

      let data = null;
      let itr = 0;

      while (itr < iterations) {
        while (true) {
          try {
            let response = await curlContent(reqUrl + params);

            data = response;
            data = await JSON.parse(data);
            if (!data.results) throw "No results";
            break;
          } catch (error) {
            attempt += 1;
            if (attempt > retries) {
              return new Promise((resolve, reject) => {
                Cache.set("images::" + keywords, results);
                resolve(results);
              });
            }
            await sleep(5000);
            continue;
          }
        }

        results = [...results, ...data.results];
        for (let i = 0; i < results.length; i++) {
          results[i]["title"] = results[i]["title"].replace(/\.+/gi, "");
        }
        Cache.set("images::" + keywords, results);
        if (!data.next) {
          return new Promise((resolve, reject) => {
            resolve(results);
          });
        }
        reqUrl = url + data["next"];
        itr += 1;
        attempt = 0;
      }
    } else {
      results = dataCache;
    }
  } catch (error) {}
  Cache.close();
  return results;
};

const getSentences = async (query) => {
  let reqUrl = "https://html.duckduckgo.com/html/?";
  try {
    let results = [];
    let dataCache = Cache.get("text::" + query);
    if (dataCache == undefined) {
      let params = new URLSearchParams({
        q: query,
      }).toString();
      let response = await curlContent(reqUrl + params);
      if (response != "err") {
        response = response.match(
          /(?<=\<a\sclass="result__snippet.*?\>).*?(?=\<\/a\>)/g
        );
        if (response != null) {
          response.forEach((e) => {
            e = e.replace(/\.+/g, ".");
            results.push(e);
          });
        }
      }
      if (results == "") {
        results[0] = `Hello, in this particular article you will provide several interesting pictures of <b>${query}</b>. We found many exciting and extraordinary <b>${query}</b> pictures that can be tips, input and information intended for you. In addition to be able to the <b>${query}</b> main picture, we also collect some other related images. Find typically the latest and best <b>${query}</b> images here that many of us get selected from plenty of other images.`;
        results[1] = `We all hope you can get actually looking for concerning <b>${query}</b> here. There is usually a large selection involving interesting image ideas that will can provide information in order to you. You can get the pictures here regarding free and save these people to be used because reference material or employed as collection images with regard to personal use. Our imaginative team provides large dimensions images with high image resolution or HD.`;
        results[2] = `<b>${query}</b> - To discover the image more plainly in this article, you are able to click on the preferred image to look at the photo in its original sizing or in full. A person can also see the <b>${query}</b> image gallery that we all get prepared to locate the image you are interested in.`;
        results[3] = `We all provide many pictures associated with <b>${query}</b> because our site is targeted on articles or articles relevant to <b>${query}</b>. Please check out our latest article upon the side if a person don't get the <b>${query}</b> picture you are looking regarding. There are various keywords related in order to and relevant to <b>${query}</b> below that you can surf our main page or even homepage.`;
        results[4] = `Hopefully you discover the image you happen to be looking for and all of us hope you want the <b>${query}</b> images which can be here, therefore that maybe they may be a great inspiration or ideas throughout the future.`;
        results[5] = `All <b>${query}</b> images that we provide in this article are usually sourced from the net, so if you get images with copyright concerns, please send your record on the contact webpage. Likewise with problematic or perhaps damaged image links or perhaps images that don't seem, then you could report this also. We certainly have provided a type for you to fill in.`;
        results[6] = `The pictures related to be able to <b>${query}</b> in the following paragraphs, hopefully they will can be useful and will increase your knowledge. Appreciate you for making the effort to be able to visit our website and even read our articles. Cya ~.`;
      }
      Cache.set("text::" + query, results);
    } else {
      results = dataCache;
    }
    return new Promise((resolve, reject) => {
      Cache.close();
      resolve(results);
    });
  } catch (e) {}
};

module.exports = { getImages, getSentences };
