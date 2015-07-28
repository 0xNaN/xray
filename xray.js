function doXray(sourceId, glassId) {
    sourceView = new SourceView(sourceId);

    // sourceView.setContent(ChromeSource(document.documentElement.outerHTML));
    sourceView.setContent(ChromeSource("<html>\n   <!-- a comment\non multiple line --><head><title> TITOLO  </title> <body>\n   <a href='ciao'> un link </a>"));

    glass = new Glass(glassId);
    glass.setSourceView(sourceView);
}

function areOverlapped(r1, r2) {
    return r1.right  >= r2.left &&
           r1.left   <= r2.right &&
           r1.top    <= r2.bottom &&
           r1.bottom >= r2.top;
}

function getIntersectionRect(r1, r2) {
  // TODO:
  //  - assuming area(r1) < area(r2) (and what if eq?)

  if(! areOverlapped(r1, r2))
    return null;

  intersection = {};

  intersection.top = (r1.top < r2.top)? r2.top : r1.top;
  intersection.left = (r1.left < r2.left)? r2.left : r1.left;

  // width
  if(r2.right > r1.right && r1.left > r2.left)
    intersection.width = r1.width;
  else if (r2.right > r1.right)
    intersection.width = r1.right - r2.left;
  else
    intersection.width = r2.right - r1.left;

  // height
  if(r2.bottom > r1.bottom && r1.top > r2.top)
    intersection.height = r1.height;
  else if (r2.bottom > r1.bottom)
    intersection.height = r1.bottom - r2.top;
  else
    intersection.height = r2.bottom - r1.top;

  return intersection;
}


function SourceView(sourceId) {
  var that = this;

  this.element = document.getElementById(sourceId);
  this.boundingRect = this.element.getBoundingClientRect();

  this.update = function(glassRect) {
    intersection = getIntersectionRect(glassRect, that.boundingRect);

    if(intersection != null) {
      that.element.style['top'] = intersection.top + "px";
      that.element.style['left'] = intersection.left + "px";
      that.element.style['width'] = intersection.width + "px";
      that.element.style['height'] = intersection.height + "px";

      // TODO:
      //  - there is "noise" when it scrolls
      that.element.scrollLeft = glassRect.left - that.boundingRect.left;
      that.element.scrollTop = glassRect.top - that.boundingRect.top;
    }
  }

  this.setContent = function (content) {
    that.element.innerHTML = content;
    that.boundingRect = this.element.getBoundingClientRect();
  }
}


function Glass(glassId) {
  var that = this;

  this.sourceView = null;
  this.element = document.getElementById(glassId);

  this.element.onmouseup = function(e) {
    e.target.onmousemove = null;
  }

  this.element.onmousedown = function(e) {
    var offx = e.offsetX;
    var offy = e.offsetY;

    that.element.onmousemove = function(ev) {
      target = ev.target;

      newx = ev.pageX - offx;
      newy = ev.pageY - offy;

      target.style['left'] = newx + "px";
      target.style['top'] = newy + "px";

      notify();
    }
  }

  this.setSourceView = function(sourceView) {
    that.sourceView = sourceView;
  }

  function notify() {
    that.sourceView.update(that.element.getBoundingClientRect());
  }
}

// aggiustare lo scope di doc nelle funzioni
function ChromeSource(rawHtml) {

  /*
   * Using an HTML document to take advantage of its functions
   * and then take its source
   */
  this.doc = document.implementation.createHTMLDocument();

  tbody = initTable(this.doc);

  lines = rawHtml.split("\n");
  lastType = null;

  for(i = 0; i < lines.length; i++) {
    line = lines[i];

    tr = this.doc.createElement("tr");
    appendLineNumber(tr, i+1);

    items = extractItems(line);

    /*
     * Here items is a list containing all
     * the items on the line, so we need to understand the type
     * e.g COMMENT, DOCTYPE, TEXT and add its content
     */
    if(items.length > 0) {
        td = this.doc.createElement("td");
        td.className = "line-content";

        items.forEach(function(item) {
            /*
            * To understand what's the type of the item
            * we could use this strategy:
            *  - a comment will always starts with <!--
            *  - a doctype will always starts with <!
            *  - a stardad tag will always starts with <[a-Z]+
            *  - all the others format is plain text
            */
            if(/^<[a-zA-Z]+/.test(item) || lastType == "STANDARD_TAG") {
                console.log("[STANDARD_TAG] ", currentItem);
                lastType = "STANDARD_TAG";

                console.log("[STANDARD_TAG] ", currentItem);
                span = this.doc.createElement("span");
                span.className = "html-tag";

                span.innerHTML = htmlEscape(item);
                td.appendChild(span);

                if(/>$/.test(item))
                    lastType = null;

            } else if(/^<!--/.test(item) || lastType == "COMMENT" ) {
                console.log("[COMMENT] ", item);
                lastType = "COMMENT";

                span = this.doc.createElement("span");
                span.className = "html-comment";

                span.innerHTML = htmlEscape(item);
                td.appendChild(span);

                if(/--!>$/.test(item))
                    lastType = null;
            }
        });

        tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  return this.doc.documentElement.outerHTML;

  /*
   * returns a list containing all items (TAGS, COMMENT, PLAIN_TEXT, DOCTYPE, ...)
   * in the given string of HTML
   * TODO: simplify maybe with some split
   */
  function extractItems(htmlLine) {
    currentItem = "";
    items = [];

    for(c = 0; c < htmlLine.length; c++) {
      ch = htmlLine[c];

      // XXX: what if '<' or '>' is between quotes?
      if(currentItem.slice(-1) == ">") {
          /*
           * Now here we have a an item done,
           *  e.g: currentItem = '<html>'
           */
          items.push(currentItem);
          currentItem = "";
      }

      currentItem += ch;
    }

    if(currentItem != "")
        items.push(currentItem);
    return items;
  }

  function appendLineNumber(tbody, number) {
    tr.appendChild((td = this.doc.createElement("td")),
                          td.className = "line-number",
                          td.setAttribute("value", number.toString()),
                          td);
  }

  function initTable(doc) {
    /* header */
    bd = doc.getElementsByTagName("body")[0];

    line_gutter_backdrop = doc.createElement("div");
    line_gutter_backdrop.className = "line-gutter-backdrop";
    bd.appendChild(line_gutter_backdrop);

    bd.appendChild(doc.createElement("table"));
    tbody = doc.createElement("tbody");
    // this is "table"
    bd.lastChild.appendChild(tbody);

    return tbody;
  }

  function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

