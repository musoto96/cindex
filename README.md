# cindex

### Description
The cindex (content indexer) package is a simple CLI (command line interface) tool used to quickly create web pages based on `html` templates.
The templates only have to meet a few html class names in order to be used. 

&nbsp;\
&nbsp;

---

### Prerequisites
1. npm and NodeJs (>=10.0.0)

&nbsp;

### Getting started.
Install package
```
npm i cindex
```


&nbsp;\
&nbsp;

---

### Usage

1. Initialize in current directory\
```cindex init .```


By default the following directories are created:
```
│   cindex.json
│   index.html
│   style.css
│
├───categories
├───drafts
│       sample.html
│
├───index
│       _index.html
│       _tags.html
│       _tags.json
│
├───pages
└───template
        page.html
        sample_template.html
```

2. Generate pages\
```cindex gen .```

This command will scan the `drafts` directory (by default) and create a new page using `template/page.html`.\
The new page will be created under `pages` directory and it will be indexed in landing page `index.hml`

3. Update pages\
```cindex up .```

This command will generate new pages and additionally scan for any changes in files inside the `drafts` directory (by default) and regenerate pages if needed.\
Any pages whose matching draft has been deleted, will be deleted and removed from index.

Any page manually added to the `pages` directory will not be deleted by the update command.\
`cindex` will check for class `cindex-gen` on the head tag of a page to recognize if a page should be deleted when it does not have a matching draft.

4. Regenerate index\
```cindex re .```

This command will regenerate the pages index in case it gets messed up.

&nbsp;\
&nbsp;

---

### Creating new content

* **In a new draft**: For every new page that is to be created, the draft must contain a tag with class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`page-title` &nbsp; This class will be used to create a link in the index, as well as for the page title.
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`cindex-tags` &nbsp; This class will be used to create an index of categories based on the tags provided, you can provide multiple comma separated values.

* **In a template**: You can add, remove and modify any element in the default template, or create your own. The template must contain a tag with the following class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`page-content` &nbsp; This class will be used to inject your draft's contents.

* **In an index.html file**: You can add/remove and modify any element in the index page, or create your own. The index must contain a tag with the following class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`pages-index` &nbsp; This class will be used to create and update the content index.
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`tag-index` &nbsp; This class will be used to create and update the index of categories.

* **In _index.html file**: A tag with the following class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`cindex-index` &nbsp; This class will be used by the reindex function.

&nbsp;\
**Note 1**: You can append additional classes to the tags with *cindex classes* above.
&nbsp;\
**Note 2**: You can delete all content from the sample/default files as long as you use the same directory structure, and *cindex classes* above.

&nbsp;\
&nbsp;