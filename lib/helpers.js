const readline = require('node:readline');
const fs = require('fs');

function help() {
  const text = `
cindex simple content indexer for websites. 

  Usage:
cindex <command> <path> 

  Commands:
init, initialize\tInitialize directory structure
gen, generate\t\tGenerate pages based on drafts
up, update\t\tGenerate pages based on drafts

  Options: 
-h, --help\t\tPrint help
`;
  console.log(text);
}

function unknown(opt) {
  const text = `
Unrecognized option: ${opt}

View command help:
npm cindex --help
`;
  console.log(text);
}

function confirmAction(opt, args) {
  let text = '';
  switch (opt) {
    case "init":
      text = `\nThe following directories will be created:
  [ ${args[1]} ]
In directory:
  [ ${args[0]} ]
Continue? [Y/n](Y):\n`;
      break;
  }

  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    input.question(text, ans => {
      ans = ans.toLowerCase();
      input.close();

      if (_yes.includes(ans) || ans == '') {
        resolve(true);
      } else {
        console.log('\nAborting.\n');
        resolve(false);
      }
    });
  })
}

async function compareFiles(path, test) {
  const arr = [];
  await new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
        throw err;
      }
      files.map((file) => {
        if (test(file)) arr.push(file);
      });
      resolve();
    });
  });
  return arr;
}

function createPage(template, content, opt="page") {
  const titleRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*page-title[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
  const titleContentRegex = /<[a-zA-Z0-9]+\b[^>]*class\s*=\s*"(?:[^"]*\s+)?page-title(?:\s+[^"]*)?"[^>]*>(.*?)<\/[a-zA-Z0-9]+>/;

  let contentRegex;
  switch (opt) {
    case "page":
      contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*page-content[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
      break;
    case "index":
      contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*pages-index[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
      break;
  }
  const padContent = '\n' + content + '\n';

  try {
    const titleContent = content.match(titleContentRegex)[1];
    let withContent;
    switch(opt) {
      case "page":
        withContent = template.replace(contentRegex, `$1${padContent}$3$4`);
        break;
      case "index":
        withContent = template.replace(contentRegex, `$1${padContent}$4`);
        break;
    }
    const withTitle = withContent.replace(titleRegex, `$1${titleContent}$4`);
    return {
      name: titleContent, 
      page: withTitle
    };
  } catch (err) {
    console.error("\nThere is a problem finding the tags needed.\n");
    throw err;
  }
}

function createHtml(html, inject, className, mode='replace') {
  const classRegex = new RegExp(className);
  const tagRegex = /[\s\t]*(\w+)/;
  let htmlStrings = html.split("\n");
  let opening = htmlStrings.find(string => classRegex.test(string));
  const closeTagRegex = new RegExp(`</${opening.match(tagRegex)[0]}`);

  if (opening.match(closeTagRegex)) {
    let toReplace = opening.replace(/>/g, ">\n");
    toReplace = toReplace.replace("</", "\n</").split("\n");
    toReplace.pop();
    htmlStrings[htmlStrings.indexOf(opening)] = toReplace;
    htmlStrings = htmlStrings.flat();
    opening = htmlStrings.find(string => classRegex.test(string));
  }
  const top = htmlStrings;
  const between = top.splice(top.indexOf(opening) + 1);
  const closing = between.find(string => closeTagRegex.test(string));
  const bottom = between.splice(between.indexOf(closing));

  let newHtml;
  switch (mode) {
    case "perpend":
      newHtml = top.concat(inject, between, bottom).join("\n");
      break;
    case "append":
      newHtml = top.concat(between, inject, bottom).join("\n");
      break;
    case "replace":
      newHtml = top.concat(inject, bottom).join("\n");
      break;
  }
  return {html: newHtml, content: between };
}

async function updateIndex(path, page, uri, date) {
  const index = (await fs.promises.readFile(`${path}/_index.html`)).toString();
  const entry = `<div>${date} - <a href="${uri}">${page}</a></div>`;
  const newIndex = index + "\n" + entry;
  await fs.promises.writeFile(`${path}/_index.html`, newIndex);
  return newIndex;
}

async function indexDel(pathIndex, uri) {
  const index = (await fs.promises.readFile(`${pathIndex}/_index.html`)).toString();
  const delRegex = new RegExp(`href="${uri}"`);
  const entries = index.split('\n');
  const filteredEntries = entries.filter(entry => !delRegex.test(entry));
  const newIndex = filteredEntries.join('\n');
  await fs.promises.writeFile(`${pathIndex}/_index.html`, newIndex);
}

async function reindex(pathPage, pathIndex) {
  const indexContent = (await fs.promises.readFile(`${pathIndex}/_index.html`)).toString();
  const indexTemplate = (await fs.promises.readFile(pathPage)).toString();
  const reIndex = createPage(indexTemplate, indexContent, "index");
  await fs.promises.writeFile(`${pathPage}`, reIndex.page);
}

async function callbackMap(arr, callback, argPath) {
  const promises = [];
  arr.map(ele => { 
    promises.push(callback(`${argPath}/${ele}`));
  });

  return Promise.all(promises).then((res) => res);
}

async function isGenerated(path) {
  const genRegex = /<head\s+id\s*=\s*"cindex-gen"\s*>/;
  const page = (await fs.promises.readFile(path)).toString();
  return (page.match(genRegex) ? true : false);
}

const defaultTemplate = (indexPage) => { return `<!DOCTYPE html>
<html lang="en">
<head id="cindex-gen">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title class="page-title"></title>

  <!-- Style  -->
  <link rel="stylesheet" href="../style.css">

  <!-- Font  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet"> 

</head>
<body>

<div class="header">
  <div class="nav">
    <a href="../index.html">
      <h1 class="title">My Website</h1>
    </a>
  </div>
</div>

<div class="wrapper">
  <div class="site-content">
    <a href="../${indexPage}"><p class="pad">Home</p></a>
    <div class="page-content">

      <div class="halfpad">
        This is a sample template for your pages.
      </div>
      <div class="halfpad">
        You can edit it, add/remove html elements
      </div>
      <div class="halfpad">
        Make sure to have one element with class <span class="code">page-content</span>
        This is the tag used for your page's contents when running: 
        <p class="code">
          cindex gen PATH
        </p>
        Or
        <p class="code">
          cindex up PATH
        </p>
      </div>
    </div>
  </div>

  <div class="footer">
    <a href="https://github.com/musoto96/cindex.git" target="_blank">
      <p>Documentation</p>
    </a>
  </div>

</div>
</body>
</html>`;
}

const sampleDraft = `<section class="pad">
  <h1 class="page-title title">Sample draft</h1>
  <p class="date pad subtitle">May 25, 2024.</p>
    This is a sample draft for sample page.

    <div>
    You can remove this page, by deleteing drafts/sample.html and running:
    </div>
    <div>
      <p class="code">
        cindex up PATH
      </p>
    </div>
</section>
`;

const sampleIndexPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index</title>

  <!-- Style  -->
  <link rel="stylesheet" href="style.css">

  <!-- Font  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet"> 


</head>
<body>

<div class="header">
  <div class="nav">
    <a href="index.html">
      <h1 class="title">My Website</h1>
    </a>
  </div>
</div>

<div class="wrapper">
<section class="pages-index site-content">
</section>
  <div class="footer">
    <a href="https://github.com/musoto96/cindex.git" target="_blank">
      <p>Documentation</p>
    </a>
  </div>
</div>
</body>
</html>`;

const sampleIndex = `<h2 class="page-title title halfpad">My Index</h2>`;

const style = `html {
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

body {
  background-color: white;
}

.header {
  background: radial-gradient(ellipse at 50% 0%, #D4E6F1 0%, #EAECEE 50%, #FFFFFF 100%);
  box-shadow: 2px 2px 2px #E5E8E8;
  margin-bottom: 2rem;
}

.title {
  font-weight: 300;
}

.subtitle {
  font-weight: 500;
  font-size: smaller
}

.pad {
  margin-bottom: 2rem;
}

.halfpad {
  margin-bottom: 1rem;
}

.code {
  font-family: 'Courier New', Courier;
  border: solid;
  border-color: #E5E8E8;
  border-width: thin;
  padding: 0.2rem;
  margin: 0.5rem;
}

.nav {
  padding: 1rem 4rem;
  display: flex;
  flex-direction: column;
  max-width: fit-content;
}

.nav a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: black;
}

.nav h1 {
  cursor: pointer;
}

.nav p {
  align-self: start;
  cursor: pointer;
}

.nav img {
  height: 42px;
  padding: 0rem 0.5rem;
  cursor: pointer;
}

.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}

.wrapper {
  padding: 0.5rem 4rem;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.site-content {
  width: 70%;
  border: solid;
  border-color: #E5E8E8;
  border-width: thin;
  padding: 2.5rem;
  min-height: 80vh;
}

.section {
  /*
  padding: 2rem;
  box-shadow: 2px 2px 5px 5px #E5E8E8;
  */
  margin: 4rem 0rem;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
}

.subsection {
  display: flex;
  margin: 1rem 0rem;
}

.subsection__panel {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.footer {
  margin: 2rem 0rem;
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  align-self: start;
}

.footer img {
  height: 12px;
  padding: 0 5px;
}

@media screen and (max-width: 1024px) {
  .site-content {
    width: 80%;
  }
}

@media screen and (max-width: 850px) {
  .nav {
    padding: 2rem 1rem;
  }

  .wrapper {
    padding: 0.8rem;
  }

  .site-content {
    width: 100%;
  }

  .subsection {
    flex-direction: column;
    margin: 1rem 0rem;
  }

  .footer {
    margin-top: 1rem;
    margin-bottom: 3rem;
  }
}`;

const config = {
  dirs: {
    drafts: "drafts",
    pages: "pages",
    templates: "template",
    index: "index",
  }, 
  files: {
    template: "page.html",
    index: "index.html",
    style: "style.css",
  },
};

const _yes = [
  'y', 'ye', 'yes', 'yea', 'yeah', 'yeahs',
  'yee', 'yesh', 'yess', 'yessir', 'yay',
];

const dirList = [
  "drafts", 
  "pages",
  "templates",
  "index",
  "assets",
  "style",
];

const commands = [
  "initialize", "init", "ini", 
  "gen", "generate", 
  "update", "upd", "up",
];

module.exports = { 
  help,
  unknown,
  confirmAction,
  compareFiles,
  dirList,
  createPage,
  updateIndex,
  indexDel,
  reindex,
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  style,
  config,
  sampleIndex,
  callbackMap,
  isGenerated,
  commands,
};