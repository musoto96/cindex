const readline = require('node:readline');
const fs = require('fs');
const { tagIndex } = require('./samples.js');

function help() {
  const text = `
cindex simple content indexer for websites. 

  Usage:
cindex <command> <path> 

  Commands:
init, initialize\tInitialize directory structure
gen, generate\t\tGenerate pages based on drafts
up, update\t\tGenerate pages based on drafts
re, regenerate\t\tRegenerate index

  Options: 
-h, --help\t\tPrint help
`;
  console.log(text);
}

function unknown(opt) {
  const text = `
Unrecognized option: ${opt}

View command help:
  cindex --help
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
  const tagRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*cindex-tags[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;

  let tagged = content;
  let contentRegex;
  let tagList = [];

  switch (opt) {
    case "page":
      contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*page-content[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;

      // Linking tags
      try {
        // Remove white space elements, and trailing white space.
        tagList = content.match(tagRegex)[3].trim().split(",");
        tagList = tagList.filter(tag => tag);
        tagList = tagList.map(tag => tag.trim());
        tags = tagList.map(tag => tag);

        tags = tags.map(tag => {
          return `<a href="../categories/${tag}.html">${tag}</a>`;
        });
        tags = `<br><br><div>Tags: ${tags.join("\n")}</div>`;
        tagged = content.replace(tagRegex, `$1\n${tags}\n$4`);

      } catch (TypeError) {
        console.log("There is a problem with the tags, or they are missing.\n");
      }

      break;
    case "index":
      contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*pages-index[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
      break;
    case "tag":
      contentRegex = /(<(\w+)[^>]*\bclass\s*=\s*["'][^"']*tag-index[^"']*["'][^>]*>)([\s\S]*?)(<\/\2>)/;
      break;
  }
  const padContent = '\n' + tagged + '\n';

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
      case "tag":
        withContent = template.replace(contentRegex, `$1${padContent}$4`);
        break;
    }
    const withTitle = withContent.replace(titleRegex, `$1${titleContent}$4`);
    return {
      name: titleContent, 
      page: withTitle,
      tags: tagList,
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

async function updateIndex(path, page, uri, date, tag="", indexFile="_index.html", useDate=true) {
  // TODO
  let indexLines;
  try {
    indexLines = (await fs.promises.readFile(`${path}/${indexFile}`)).toString().split("\n");
  } catch (err) {
    indexLines = (await fs.promises.readFile(`${path}/_tags.html`)).toString().split("\n");
  }
  const index = indexLines.slice(0, indexLines.length-1).join("\n");

  let entry;
  if (useDate) {
    entry = `<li class="cindex-index">${date} - <a href="${uri}">${page}</a></li>`;
  } else {
    entry = `<li class="cindex-index"><a href="${uri}">${page}</a></li>`;
  }

  const newIndex = index + "\n" + entry + "\n</ol>";
  // TODO
  if (tag != "") {
  }
  await fs.promises.writeFile(`${path}/${indexFile}`, newIndex);
  return newIndex;
}

async function indexDel(pathIndex, uri, indexFile="_index.html") {
  const index = (await fs.promises.readFile(`${pathIndex}/${indexFile}`)).toString();
  const delRegex = new RegExp(`href="${uri}"`);
  const entries = index.split('\n');
  const filteredEntries = entries.filter(entry => !delRegex.test(entry));
  const newIndex = filteredEntries.join('\n');
  return await fs.promises.writeFile(`${pathIndex}/${indexFile}`, newIndex);
}

async function indexReset(pathIndex, indexFile="_index.html") {
  const index = (await fs.promises.readFile(`${pathIndex}/${indexFile}`)).toString();
  const delRegex = new RegExp("cindex-index");
  const entries = index.split('\n');
  const filteredEntries = entries.filter(entry => !delRegex.test(entry));
  const newIndex = filteredEntries.join('\n');
  await fs.promises.writeFile(`${pathIndex}/${indexFile}`, newIndex);
}

async function reindex(pathPage, pathIndex, indexFile="_index.html") {
  const indexContent = (await fs.promises.readFile(`${pathIndex}/${indexFile}`)).toString();
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

const config = {
  dirs: {
    drafts: "drafts",
    pages: "pages",
    templates: "template",
    index: "index",
    categories: "categories",
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
  "regenerate", "regen", "re",
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
  indexReset,
  reindex,
  config,
  callbackMap,
  isGenerated,
  commands,
};