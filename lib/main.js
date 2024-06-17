const fs = require('fs');
const { 
  confirmAction,
  compareFiles,
  createPage,
  updateIndex,
  indexDel,
  indexReset,
  callbackMap,
  isGenerated,
  reindex,
  config,
} = require('./helpers.js');
const {
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  sampleIndex,
  style,
} = require('./samples.js');

async function init(argPath) {
  const path = (argPath ? argPath : './');

  let configFile;
  try {
    configFile = (await fs.promises.readFile(`${path}/cindex.json`)).toString();
  } catch (err) {
    if (err.code != "ENOENT") {
      console.error('Error reading cindex.json');
      throw err
    };
  }

  let _config;
  if (configFile) {
    console.log("\nConfig file cindex.json found.")
    _config = JSON.parse(configFile);
  } else {
    console.log("\nConfiguration file cindex.json was not found. Using defaults.")
    _config = config;
  }

  const _test = (element) => [...Object.values(_config.dirs), _config.files.index].includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length > 0) throw new Error(`\nSome files are in the way:\n${conflicts}`);

  const answer = await confirmAction("init", [path, Object.values(_config.dirs)]);
  if (answer) {
    console.log("Creating directory structure ...")
    const createPromises = [];
    for (const dir in _config.dirs) {
      createPromises.push(new Promise((resolve, reject) => {
        fs.mkdir(`${path}/${_config.dirs[dir]}`, (err) => {
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
        fs.promises.writeFile(`${path}/${_config.dirs.templates}/${_config.files.template}`, defaultTemplate(_config.files.index));
        fs.promises.writeFile(`${path}/${_config.files.index}`, sampleIndexPage(_config.files.index));
        fs.promises.writeFile(`${path}/${_config.files.style}`, style);
        fs.promises.writeFile(`${path}/${_config.dirs.index}/_index.html`, sampleIndex);
        fs.promises.writeFile(`${path}/${_config.dirs.drafts}/sample.html`, sampleDraft);
        fs.promises.writeFile(`${path}/cindex.json`, JSON.stringify(_config, null, 2));
        console.log('Success\n')
      })
      .catch(err => {
        console.error("\nError initializing directories and files.")
        throw err;
      });
  } else {
    console.log("A configuration file cindex.json has been created.\nRun init command again after your configurations.\n")
    fs.promises.writeFile(`${path}/cindex.json`, JSON.stringify(_config, null, 2));
  }
}

async function generate(argPath, printInfo=true) {
  const path = (argPath ? argPath : './');

  let configFile;
  try {
    configFile = (await fs.promises.readFile(`${path}/cindex.json`)).toString();
  } catch (err) {
    console.error('Error reading cindex.json');
    throw err
  }
  const  _config = JSON.parse(configFile);

  const _test = (element) => [...Object.values(_config.dirs), _config.files.index].includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length < [...Object.values(_config.dirs), _config.files.index].length) throw new Error(`Some files are missing. Run init command first:\n  cindex init ${argPath}`);

  const drafts = await fs.promises.readdir(`${path}/${_config.dirs.drafts}`);
  const pages = await fs.promises.readdir(`${path}/${_config.dirs.pages}`);

  const missing = drafts.filter(draft => {
    if (!pages.includes(draft)) return draft;
  });

  if (printInfo) {
    console.log(`\n${_config.dirs.drafts} (${drafts.length}):  ${drafts}`);
    console.log(`${_config.dirs.pages} (${pages.length}):  ${pages}`);
    console.log(`New ${_config.dirs.drafts} (${missing.length}):  ${missing}\n`);
  }

  if (missing.length > 0) {
    const pageTemplate = (await fs.promises.readFile(`${path}/${_config.dirs.templates}/${_config.files.template}`)).toString();
    const indexTemplate = (await fs.promises.readFile(`${path}/${_config.files.index}`)).toString();
    for (const draft of missing) {
      const pageContent = (await fs.promises.readFile(`${path}/${_config.dirs.drafts}/${draft}`)).toString();
      const stat = await fs.promises.stat(`${path}/${_config.dirs.drafts}/${draft}`);
      const fileDate = stat.mtime.toDateString();
      const fileTime = stat.mtime.toTimeString().split(" ")[0];

      // Create page
      const { name, page } = createPage(pageTemplate, pageContent, "page");
      fs.promises.writeFile(`${path}/${_config.dirs.pages}/${draft}`, page);

      // Update index
      const newIndex = await updateIndex(`${path}/${_config.dirs.index}`, name, `${_config.dirs.pages}/${draft}`, fileDate + ", " + fileTime);
      const indexPage = createPage(indexTemplate, newIndex, "index").page;
      fs.promises.writeFile(`${path}/${_config.files.index}`, indexPage);

      console.log(`Page created: ${path}/${_config.dirs.pages}/${draft}\n`);
    }
  } else {
    console.log("No new draft files to generate.\n")
  }
}

async function update(argPath) {
  const path = (argPath ? argPath : './');

  let configFile;
  try {
    configFile = (await fs.promises.readFile(`${path}/cindex.json`)).toString();
  } catch (err) {
    console.error('Error reading cindex.json');
    throw err
  }
  const  _config = JSON.parse(configFile);

  const _test = (element) => [...Object.values(_config.dirs), _config.files.index].includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length < [...Object.values(_config.dirs), _config.files.index].length) throw new Error(`Some files are missing. Run init command first:\n  cindex init ${argPath}`);

  const drafts = await fs.promises.readdir(`${path}/${_config.dirs.drafts}`);
  const pages = await fs.promises.readdir(`${path}/${_config.dirs.pages}`);
  let deleted = [];

  if ( !(drafts.length == 0 && pages.length == 0) ) {

    const missing = drafts.filter(draft => {
      if (!pages.includes(draft)) {
        drafts.splice(drafts.indexOf(draft), 1);
        return draft;
      };
    });

    // Pages that are not in drafts
    await new Promise((resolve) => {
      if (pages.length === 0) {
        resolve();
        return;
      }
    
      let i = 0;
      const len = pages.length;
    
      // Create a shallow copy of pages to iterate over
      for (let page of [...pages]) { 
        
        if (!drafts.includes(page)) {
          const isGen = isGenerated(`${path}/${_config.dirs.pages}/${page}`);
          
          if (isGen) {
            deleted.push(page);
          }
    
          pages.splice(pages.indexOf(page), 1); // Modify the original array
        }
        i++;
        if (i === len) {
          resolve();
          break;
        }
      }
    });

    let draftsStats, pagesStats;
    try {
      draftsStats = await callbackMap(drafts, fs.promises.stat, `${path}/${_config.dirs.drafts}`);
      pagesStats = await callbackMap(pages, fs.promises.stat, `${path}/${_config.dirs.pages}`);
    } catch (err) {
      console.error("\nError updating pages.")
      throw err;
    }
    let regen;
    if (pages.length != 0) {
      regen = drafts.filter((_, index) => draftsStats[index].mtimeMs > pagesStats[index].mtimeMs);
    } else {
      regen = [];
    }

    console.log(`\n${_config.dirs.drafts} (${drafts.length}):  ${drafts}`);
    console.log(`${_config.dirs.pages} (${pages.length}):  ${pages}`);
    console.log(`New ${_config.dirs.drafts} (${missing.length}):  ${missing}`);
    console.log(`Deleted (${deleted.length}):  ${deleted}`);
    console.log(`Regenerate (${regen.length}):  ${regen}\n`);

    if (regen.length > 0) {
      for (const file of regen) {
        await fs.promises.rm(`${path}/${_config.dirs.pages}/${file}`);
      }
    }
    if (deleted.length > 0) {
      for (const file of deleted) {
        console.log(`Reindexing ${path}/${_config.files.index}\n`);
        await fs.promises.rm(`${path}/${_config.dirs.pages}/${file}`);
        await indexDel(`${path}/${_config.dirs.index}`, `${_config.dirs.pages}/${file}`);
        reindex(`${path}/${_config.files.index}`, `${path}/${_config.dirs.index}`);
      }
    }
    await generate(path, false);

    if (missing.length == 0 && regen.length == 0 && deleted.length == 0 ) {
      console.log(`Reindexing ${path}/${_config.files.index}\n`);
      reindex(`${path}/${_config.files.index}`, `${path}/${_config.dirs.index}`);
    }
  } else {
    console.log(`\n${_config.dirs.drafts} (${drafts.length}):  ${drafts}`);
    console.log(`${_config.dirs.pages} (${pages.length}):  ${pages}\n`);
    console.log(`Nothing to do on ${path}\n`);
  }
}

async function regenerate(argPath) {
  const path = (argPath ? argPath : './');

  let configFile;
  try {
    configFile = (await fs.promises.readFile(`${path}/cindex.json`)).toString();
  } catch (err) {
    console.error('Error reading cindex.json');
    throw err
  }
  const  _config = JSON.parse(configFile);

  const _test = (element) => [...Object.values(_config.dirs), _config.files.index].includes(element);
  const conflicts = await compareFiles(path, _test);
  if (conflicts.length < [...Object.values(_config.dirs), _config.files.index].length) throw new Error(`Some files are missing. Run init command first:\n  cindex init ${argPath}`);

  const drafts = await fs.promises.readdir(`${path}/${_config.dirs.drafts}`);
  const pages = await fs.promises.readdir(`${path}/${_config.dirs.pages}`);

  console.log(`Reindexing ${path}/${_config.files.index}\n`);
  await indexReset(`${path}/${_config.dirs.index}`);
  await reindex(`${path}/${_config.files.index}`, `${path}/${_config.dirs.index}`);

  // Recreate index
  await new Promise(async (resolve) => {
    if (pages.length === 0) {
      resolve();
      return;
    }

    let i = 0;
    const len = pages.length;
  
    // Get templates
    const pageTemplate = (await fs.promises.readFile(`${path}/${_config.dirs.templates}/${_config.files.template}`)).toString();
    const indexTemplate = (await fs.promises.readFile(`${path}/${_config.files.index}`)).toString();

    for (let draft of [...drafts]) { 

      // Get draft info, date, name, etc.
      const pageContent = (await fs.promises.readFile(`${path}/${_config.dirs.drafts}/${draft}`)).toString();
      const stat = await fs.promises.stat(`${path}/${_config.dirs.drafts}/${draft}`);
      const fileDate = stat.mtime.toDateString();
      const fileTime = stat.mtime.toTimeString().split(" ")[0];

      // Get name
      const { name, _ } = createPage(pageTemplate, pageContent, "page");

      // Update index
      const newIndex = await updateIndex(`${path}/${_config.dirs.index}`, name, `${_config.dirs.pages}/${draft}`, fileDate + ", " + fileTime);
      const indexPage = createPage(indexTemplate, newIndex, "index").page;
      fs.promises.writeFile(`${path}/${_config.files.index}`, indexPage);

      i++;
      if (i === len) {
        resolve();
        break;
      }
    }
  });
}

module.exports = { 
  init,
  generate,
  update,
  regenerate,
};