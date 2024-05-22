const readline = require('node:readline');
const fs = require('fs');

function help() {
  const text = `
cindex simple content indexer for websites. 

  Usage:
cindex <command> <path> 

  Commands:
init, initialize\t\tInitialize directory structure
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
  [ ${dirList} ]
In directory:
  [ ${args} ]
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

function createPage(template, content) {
  const contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*page-content[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
  const titleRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*page-title[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
  const titleContentRegex = /<[a-zA-Z0-9]+\b[^>]*class\s*=\s*"(?:[^"]*\s+)?page-title(?:\s+[^"]*)?"[^>]*>(.*?)<\/[a-zA-Z0-9]+>/;
  const padContent = '\n' + content + '\n';

  try {
    const titleContent = content.match(titleContentRegex)[1];
    const withContent = template.replace(contentRegex, `$1${padContent}$3$4`);
    const withTitle = withContent.replace(titleRegex, `$1${titleContent}$3$4`);
    return {
      name: titleContent, 
      page: withTitle
    };
  } catch (err) {
    console.error("\nThere is a problem finding the tags needed.\n");
    throw err;
  }
}

async function updateIndex(path, page, uri, date) {
  const index = (await fs.promises.readFile(`${path}/index/index.html`)).toString();
  const entry = `<div>${date} - <a href="${uri}">${page}</a></div>`;
  const newIndex = index + "\n" + entry;
  await fs.promises.writeFile(`${path}/index/index.html`, newIndex);
  return newIndex;
}

async function createIndex(path, indexData) {
  const indexPage = (await fs.promises.readFile(`${path}/pages/index.html`)).toString();
  //updateHtml(indexPage, null, "pages-index");
  const indexRegex = /(<section\s[^>]*class\s*=\s*["'][^"']*\bpages-index\b[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/i;

  try {
    const newIndex = indexPage.replace(indexRegex, `$1${indexData + "\n"}$3`);
    await fs.promises.writeFile(`${path}/pages/index.html`, newIndex);
  } catch (err) {
    console.error("\nThere is a problem finding the tags needed.\n");
    throw err;
  }
}

async function indexDel(path, uri) {
  const index = (await fs.promises.readFile(`${path}/index/index.html`)).toString();
  const delRegex = new RegExp(`href="${uri}"`);
  const entries = index.split('\n');
  const filteredEntries = entries.filter(entry => !delRegex.test(entry));
  const newIndex = filteredEntries.join('\n');

  await fs.promises.writeFile(`${path}/index/index.html`, newIndex);
  return await createIndex(path, newIndex);
}

async function reindex(path) {
  /**
   * TODO 
   * Regenerate index
   */
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

const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head id="cindex-gen">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title class="page-title"></title>
</head>
<body class="page-content">
<h2>
  This is a sample template for your pages.
  you can edit it and add/remove html elements
  make sure to have one element with page-content class.
  This will be the tag that your page's contents are injected when running: 
  cindex in/up myWebsite/
</h2>
</body>
</html>`;

const sampleDraft = `<section>
  <h1 class="page-title">Sample draft</h1>
  <p class="date">May 25, 2024.</p>
    This is a sample draft for sample page.

    You can remove this page, by deleteing drafts/sample.html 
    and running:
      cindex up mywebsite
</section>`;

const sampleIndexPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index</title>
</head>
<body>
<section class="pages-index">
</section>
</body>
</html>`;

const sampleIndex = ``;

const _yes = [
  'y', 'ye', 'yes', 'yea', 'yeah', 'yeahs',
  'yee', 'yesh', 'yess', 'yessir', 'yay',
];

const dirList = [
  "drafts", 
  "pages",
  "templates",
  "assets",
  "style",
  "index",
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
  createIndex,
  indexDel,
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  sampleIndex,
  callbackMap,
  isGenerated,
  commands,
};