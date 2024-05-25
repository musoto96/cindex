# cindex

### Description
The cindex (content indexer) package is a simple CLI (command line interface) tool used to quickly create web pages based on `html` templates.\
The templates only have to meet a few html class names in order to be used. 

&nbsp;\
&nbsp;

### Prerequisites
1. npm and NodeJs (>=10.0.0)

&nbsp;

### Getting started.
Install packages
```
npm install https://github.com/musoto96/cindex
```


&nbsp;\
&nbsp;

### Usage

1. Initialize in current directory\
```cindex init .```


By default the following directories are created:
```
│   cindex.json
│   index.html
│   style.css
│
├───drafts
│       sample.html
│       
├───index
│       _index.html
│
├───pages
│
└───template
        page.html
```

2. Generate pages\
```cindex gen .```

This command will scan the `drafts` directory (by default) and create a new page using `template/page.html`.\
The new page will be created under `pages` directory and it will be indexed in landing page `index.hml`

3. Update pages\
```cindex up .```

This command generate new pages and additionally scan for any changes in files inside the `drafts` directory (by default) and regenerate pages if needed.\
Any pages which matching draft has been deleted will be deleted.

Any page manually added to the `pages` directory will not be deleted by the update command.\
`cindex` will check for class `cindex-gen` on the head tag of a page to recognize if a page should be deleted when it does not have a matching draft or not.

&nbsp;\
&nbsp;

---

### Creating new content

* For every new page that is to be created it must contain one element with class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`page-title` &nbsp; This class will be used to create a link in the index, as well as for the page title.

* You can add/remove and modify any element in the default template, or create your own. The template must contain the following class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`page-content` &nbsp; This class will be used to create a link in the index, as well as for the page title.

* You can add/remove and modify any element in the index page, or create your own. The index must contain the following class:\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`pages-index` &nbsp; This class will be used to create and update the content index.

&nbsp;\
&nbsp;