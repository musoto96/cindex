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
  <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

</head>
<body>

<div>
  <div>
    <a href="../index.html">
      <h1>My Website</h1>
    </a>
    <p>Change me in <code>index.html</code></p>
  </div>
</div>

<a href="javascript:history.back()"><p">Back</p></a>

<hr>
<br>
<br>

<div>
  <div>
    <a href="../${indexPage}"><p">Home</p></a>
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

      <div">
        This is a sample template for your pages. Edit it under: <code>templates/page.html</code>
      </div>
      <div">
        This content will be present for every new page you create.
      </div>
      <div">
        Make sure to have one element with class <code>page-content</code>
        This is the tag used for your page's contents when running: 
        <pre>
<code>cindex gen PATH</code>
        </pre>
        Or
        <pre>
<code>cindex up PATH</code>
        </pre>
        <br>
        Where PATH is the destination where your website was initiated e.g. 
        <pre>
<code>cindex gen .
cindex up .</code>
        </pre>
      </div>
    </div>


    <div class="tag-index">
    </div>

  </div>

  <!-- Remove me -->
  <p>
    <a href="https://www.npmjs.com/package/cindex" target="_blank">Documentation</a>
  </p>
  <p>Remove me in: <code>template/page.html</code></p>

</div>
</body>
</html>`;
}

const sampleDraft = `<section>
  <h1 class="page-title">Sample draft</h1>
  <p class="date">May 25, 2024.</p>
  <p>
    This is a sample draft for sample page.
  </p>
  <p>
    This is the html content that was injected from <code>draft/sample.html</code> into <code>template/page.html</code> to create a resulting file <code>pages/sample.html</code>
  </p>

  <br>

  <div>Remove this page, by deleteing <code>drafts/sample.html</code> and running:</div>
  <pre>
<code>cindex up PATH</code>
  </pre>
  <div>Or by manually deleting both the page and its corresponding sample.</div>

  <div class="cindex-tags">
    test,sample
  </div>
    
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
  <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

</head>
<body>

<div>
  <div>
    <a href="${indexPage}">

      <!--
        cindex doc: 
        Change me!.
      -->
      <h1>My Website</h1>
    </a>
    <p>Change me in <code>index.html</code></p>
  </div>
</div>

<hr>
<br>
<br>

<div>
  <div>

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
      <br>Thank you for giving cindex a try.<br>
    </h4>

    <br>

    <p>
      This is the index page. You can edit it directly following the inline comments in the html file.<br>
      Don't worry they are short comments.<br>
      <br>
      If you just initialized a website with cindex, the page index below will likely be empty.
      To test it run:
    </p>

    <pre>
<code>cindex gen</code>
    </pre>

    <p>
      Where <code>PATH</code> is the destination where your website was initiated e.g. 
    </p>

    <pre>
<code>cindex gen .</code>
    </pre>

    <p>
      This will use a sample draft file and create a page.
    </p>

    <br>
    <br>
    <hr>
    <br>
    <br>

    <section class="tag-index">
      <!-- This will get wiped after the first tag indexing operation. -->
    </section>

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
  <p>
    <a href="https://www.npmjs.com/package/cindex" target="_blank">Documentation</a>
  </p>
  <p>Remove me in: <code>index.html</code></p>

</html>`;

const sampleCategoryPage = (indexPage, category) => `<!--cindex doc: 

You can customize this page directly.
Add or remove links and sources, etc.

For cindex you only need to have one tag with class="pages-index" and "tag-index"
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
  <title>${category}</title>

  <!-- Style  -->
  <link rel="stylesheet" href="../style.css">

  <!-- Font  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

</head>
<body>

<div>
  <div>
    <a href="../${indexPage}">

      <!--
        cindex doc: 
        Change me!.
      -->
      <h1>My Website</h1>
    </a>
    <p>Change me in <code>index.html</code></p>
  </div>
</div>

<a href="javascript:history.back()"><p">Back</p></a>

<hr>
<br>
<br>

<div>
  <div>

  <!--
    IMPORTANT: All html content inside the tag with class="pages-index|tag-index" will be replaced by the content in index/_index.html
  -->

  <div>
    <section class="tag-index">
      <!-- This will get wiped after the first tag indexing operation. -->
    </section>
  </div>

  </div>

  <!-- Remove me -->
  <p>
    <a href="https://www.npmjs.com/package/cindex" target="_blank">Documentation</a>
  </p>
  <p>Remove me in: <code>index.html</code></p>

  </div>
  </body>
</html>`;


const sampleDraftTemplate = `<section>
  <h1 class="page-title">Title</h1>
  <p class="date">Month XX, 20XX.</p>

  <br>
  <br>
  <hr>
  <br>
  <br>

  <article>

    <p>
      Intro
    </p>


    <br>

    <hr>

    <br>


    <h3 id="table-of-contents">
      Table of contents
    </h3>

    <ul>

      <li><a href="#table-of-contents">
        Table of contents
      </a></li>

      <li><a href="#item-one">
        item one
      </a></li>

      <li><a href="#item-two">
        item two
      </a></li>

    </ul>

    <br> 

    <hr>

    <br> 


    <h4 id="item-one">
      item one
    </h4>

    <p>
      Bla bla bla
    </p>

    <pre>
<code>// This is code
Hello_world();</code>
    </pre>

    <p>
      Bla, bla
    <br>
      Bla, bla <code>2 &gt; 1 &gt; -1</code>
    </p>


    <p><a href="#top">[Top]</a></p><br>


    <h4 id="item-two">
      item two
    </h4>

    <p>
      Bla, bla
      <br>
      Item two
    </p>

    <pre>
<code>&amp;F&amp;C1&amp;D2E0S0=0</code>
    </pre>

    <p>
      Bla, bla
    </p>

    <p><a href="#top">[Top]</a></p><br>

  </article>

  <div id="cindex-tags">
    test,sample
  </div>

</section>
`;

const sampleIndex = `<p>Change me in <code>index/_index.html</code></p>
<h2 class="page-title">My Index</h2>
<ol id="index-list">
`;

// TODO 
const tagIndex = (tag="Categories") => `<p>Change me in <code>index/_tags.html</code></p>
<h2 class="page-title" id="tagpage-title">${tag}</h2>
<ol id="tag-list">
`;

const style = `html {
  font-family: 'Courier Prime', sans-serif;
  font-size: small;
}

html a {
 color: blue;
}

code {
  background-color: aliceblue;
  line-height: normal;
}`;

module.exports = { 
  defaultTemplate,
  sampleDraft,
  sampleIndexPage,
  sampleCategoryPage,
  sampleDraftTemplate,
  sampleIndex,
  tagIndex,
  style,
};