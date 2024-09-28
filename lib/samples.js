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
      <p class="subtitle">Change me in <span class="icode">index.html</span></p>
    </a>
  </div>
</div>

<div class="wrapper">
  <div class="site-content">
    <a href="../${indexPage}"><p class="pad">Home</p></a>
    <div class="page-content">

      <!--
        cindex doc:

        The div above has class="page-content". This is where the content for new drafts will be injected.
        You can edit everything else. Do not edit the page directly, instead edit either the draft file to change its contents,
        or the template file to change content shown across all pages. 

        Then run cindex up PATH

        Where PATH is the destination where your website was initiated e.g. 
          cindex up . 
      -->

      <br>
      <br>
      <hr>
      <br>
      <br>

      <!--
        cindex doc:

        The content below will be shown across all pages. To change it: 
        1. Change the template file
        2. Delete the pages (not the drafts)
        3. And regenerate the pages with: 
          cindex up PATH

        Where PATH is the destination where your website was initiated e.g. 
          cindex up . 
      -->

      <div class="halfpad">
        This is a sample template for your pages. Edit it under: <span class="icode">templates/page.html</span>
      </div>
      <div class="halfpad">
        This content will be present for every new page you create.
      </div>
      <div class="halfpad">
        Make sure to have one element with class <span class="icode">page-content</span>
        This is the tag used for your page's contents when running: 
        <p class="code">
          cindex gen PATH
        </p>
        Or
        <p class="code">
          cindex up PATH
        </p>
        <br>
        Where PATH is the destination where your website was initiated e.g. 
        <p class="code">
          cindex up . 
          cindex gen . 
        </p>
      </div>
    </div>
  </div>

  <!-- Remove me -->
  <div class="footer">
    <a href="https://github.com/musoto96/cindex.git" target="_blank">
      <p>Documentation</p>
    </a>
    <p class="subtitle">Remove me in: <span class="icode">template/page.html</span></p>
  </div>

</div>
</body>
</html>`;
}

const sampleDraft = `<section class="pad">
  <h1 class="page-title title">Sample draft</h1>
  <p class="date pad subtitle">May 25, 2024.</p>
  <tags id="cindex-tag" hidden>Test</tags>
    <p>
      This is a sample draft for sample page.
    </p>
    <p>
      This is the html content that was injected from <span class="icode">draft/sample.html</span> into <span class="icode">template/page.html</span> to create a resulting file <span class="icode">pages/sample.html</span>
    </p>

    <br>

    <div>Remove this page, by deleteing <span class="icode">drafts/sample.html</span> and running:</div>
    <div>
      <p class="code">
        cindex up PATH
      </p>
    </div>
    <div>Or by manually deleting both the page and its corresponding sample.</div>
    
</section>
`;

const sampleIndexPage = (indexPage) => `<!--cindex doc: 

You can customize this page directly.
Add or remove links and sources, etc.

For cindex you only need to have one tag with class="pages-index"
This is where new pages will be indexed when running cindex up|gen PATH

Where PATH is the destination where your website was initiated e.g. 
  cindex up . 
  cindex gen . 
-->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!--
    cindex doc: 
    Change me!
  -->
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
    <a href="${indexPage}">

      <!--
        cindex doc: 
        Change me!.
      -->
      <h1 class="title">My Website</h1>
      <p class="subtitle">Change me in <span class="icode">index.html</span></p>
    </a>
  </div>
</div>

<div class="wrapper">
  <div class=" site-content">
  <!--
    cindex doc:
    
    This is the default index page. Where your new pages will be listed when running cindex gen|up PATH

    Where PATH is the destination where your website was initiated e.g. 
      cindex up . 
      cindex gen . 

    You can edit all elements inside here, but be sure to leave one tag with class="pages-index" where 
    the index for your pages will be injected.
    Currently this class is in the section tag directly below this comment.

    You can find class="pages-index" below this comment. As you see, you can append additional classes for styling, 
    This will not cause problems to cindex parsing functions.


    The links to new pages will appear here, create a draft and run:
      cindex gen PATH

    Where PATH is the destination where your website was initiated e.g. 
      cindex gen . 


    IMPORTANT: All html content inside the tag with class="pages-index" will be replaced by the content in index/_index.html
  -->

  <div>
    <h4>
      Thank you for giving cindex a try.<br>
    </h4>
    <br>
    <p>
      This is the index page. You can edit it directly following the inline comments in the html file.<br>
      Don't worry they are short comments.<br>
      <br>
      If you just initialized a website with cindex, the page index below will likely be empty.
      To test it run:
    </p>
    <p class="code">
      cindex gen
    </p>
    <p>
      Where <span class="icode">PATH</span> is the destination where your website was initiated e.g. 
    </p>
    <p class="code">
      cindex gen . 
    </p>
    <p>
      This will use a sample draft file and create a page.
    </p>
  </div>

  <br>
  <br>
  <hr>
  <br>
  <br>

  <section class="pages-index">
    <!-- This will get wiped after the first indexing operation. -->
  </section>

  </div>

  <!-- Remove me -->
  <div class="footer">
    <a href="https://github.com/musoto96/cindex.git" target="_blank">
      <p>Documentation</p>
    </a>
    <p class="subtitle">Remove me in: <span class="icode">index.html</span></p>
  </div>

</div>
</body>
</html>`;

const sampleIndex = `<p class="subtitle">Change me in <span class="icode">index/_index.html</span></p>
<h2 class="page-title title halfpad">My Index</h2>
<ol id="index-list">
`;

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

body ol {
  list-style: none;
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

.icode {
  font-family: 'Courier New', Courier;
  border: solid;
  border-color: #E5E8E8;
  border-width: thin;
  padding: 0.2rem;
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

module.exports = { 
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  sampleIndex,
  style,
};