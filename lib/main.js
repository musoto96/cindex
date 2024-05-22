const fs = require('fs');
const { 
  dirList,
  confirmAction,
  compareFiles,
  createPage,
  updateIndex,
  createIndex,
  indexDel,
  callbackMap,
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  sampleIndex,
  isGenerated,
} = require('./helpers.js');

async function init(argPath) {
  const path = (argPath ? argPath : './');
  const _test = (element) => dirList.includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length > 0) throw new Error(`\nSome files are in the way:\n${conflicts}`);

  const answer = await confirmAction('init', path);
  if (answer) {
    console.log("Creating directory structure ...")
    const createPromises = [];
    for (const dir of dirList) {
      createPromises.push(new Promise((resolve, reject) => {
        fs.mkdir(`${path}/${dir}`, (err) => {
          if (err) {
            reject(err);
            throw err;
          };
          resolve();
        });
      }));
    }
    Promise.all(createPromises)
      .then(() => {
        console.log("Creating default files ...")
        fs.promises.writeFile(`${path}/templates/page.html`, defaultTemplate);
        fs.promises.writeFile(`${path}/drafts/sample.html`, sampleDraft);
        fs.promises.writeFile(`${path}/pages/index.html`, sampleIndexPage);
        fs.promises.writeFile(`${path}/index/index.html`, sampleIndex);
        console.log('Success\n')
      })
      .catch(err => {
        console.error("\nError initializing directories and files.")
        throw err;
      });
  }
}

async function generate(argPath, printInfo=true) {
  const path = (argPath ? argPath : './');
  const _test = (element) => dirList.includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length < dirList.length) throw new Error(`Some files are missing. Run init command first:\n  cindex init ${argPath}`);

  const drafts = await fs.promises.readdir(`${path}/drafts`);
  const pages = await fs.promises.readdir(`${path}/pages`);

  const missing = drafts.filter(draft => {
    if (!pages.includes(draft)) return draft;
  });

  if (printInfo) {
    console.log(`\nDrafts (${drafts.length}): ${drafts}`);
    console.log(`Pages (${pages.length}): ${pages}`);
    console.log(`New drafts (${missing.length}): ${missing}`);
  }

  if (missing.length > 0) {
    const pageTemplate = (await fs.promises.readFile(`${path}/templates/page.html`)).toString();
    for (const draft of missing) {
      const pageContent = (await fs.promises.readFile(`${path}/drafts/${draft}`)).toString();
      const stat = await fs.promises.stat(`${path}/drafts/${draft}`);
      const fileDate = stat.mtime.toDateString();
      const fileTime = stat.mtime.toTimeString().split(" ")[0];

      const { name, page } = createPage(pageTemplate, pageContent);
      fs.promises.writeFile(`${path}/pages/${draft}`, page);

      // Update index
      const newIndex = await updateIndex(path, name, draft, fileDate + ", " + fileTime);
      createIndex(path, newIndex);

      console.log(`Page created: ${path}/pages/${draft}\n`);
    }
  } else {
    console.log("\nNo new draft files to generate.\n")
  }
}

async function update(argPath) {
  const path = (argPath ? argPath : './');
  const _test = (element) => dirList.includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length < dirList.length) throw new Error(`Some files are missing. Run init command first:\n  cindex init ${argPath}`);

  const drafts = await fs.promises.readdir(`${path}/drafts`);
  const pages = await fs.promises.readdir(`${path}/pages`);
  let deleted = [];

  const missing = drafts.filter(draft => {
    if (!pages.includes(draft)) {
      drafts.splice(drafts.indexOf(draft), 1)
      return draft
    };
  });

  // Pages that are not in drafts
  const check = new Promise((resolve) => {
    let i = 0;
    pages.filter(async (page) => {
      if (!drafts.includes(page)) {
        const isGen = await isGenerated(`${path}/pages/${page}`);
        if (i == pages.length - 1) resolve();
        if (isGen) {
          deleted.push(page)
        }
        pages.splice(pages.indexOf(page), 1)
        return page
      } else {
        i++;
        if (i == pages.length - 1) resolve();
      }
    });
  })

  let draftsStats, pagesStats;
  try {
    draftsStats = await callbackMap(drafts, fs.promises.stat, `${path}/drafts`);
    pagesStats = await callbackMap(pages, fs.promises.stat, `${path}/pages`);
  } catch (err) {
    console.error("\nError updating pages.")
    throw err;
  }
  const regen = drafts.filter((_, index) => draftsStats[index].mtimeMs > pagesStats[index].mtimeMs);

  await check;
  console.log(`\nDrafts (${drafts.length}): ${drafts}`);
  console.log(`Pages (${pages.length}): ${pages}`);
  console.log(`New drafts (${missing.length}): ${missing}`);
  console.log(`Deleted (${deleted.length}): ${deleted}`);
  console.log(`Regenerate (${regen.length}): ${regen}\n`);

  if (regen.length > 0) {
    for (const file of regen) {
      await fs.promises.rm(`${path}/pages/${file}`);
    }
  }
  if (deleted.length > 0) {
    for (const file of deleted) {
      await fs.promises.rm(`${path}/pages/${file}`);
      await indexDel(path, file);
    }
  }
  await generate(path, false);
}

module.exports = { 
  init,
  generate,
  update,
};