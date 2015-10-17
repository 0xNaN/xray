function doXray(sourceId, glassId) {
    sourceView = new SourceView(sourceId);

    sourceView.setContent(ChromeSource(document.documentElement.outerHTML));
  //  sourceView.setContent(ChromeSource("<html>\n   <!-- a comment\non multiple line --><head><title> TITOLO  </title> <body>\n   <a href='ciao'> un link </a>"));

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

  globalLastType = null; //XXX: fix the global scope

  var sourceViewDocument = document.implementation.createHTMLDocument();
  var sourceViewTBody = appendChromeSourceDecorationTable(sourceViewDocument);

  htmlLines = rawHtml.split("\n");
  for(i = 0; i < htmlLines.length; i++) {
    htmlLine = htmlLines[i];

    sourceViewTr = sourceViewDocument.createElement("tr");

    appendChromeSourceDecorationNumber(sourceViewTr, i+1);
    appendChromeSourceDecorationContent(sourceViewTr, htmlLine);

    sourceViewTBody.appendChild(sourceViewTr);
  }

  return sourceViewDocument.documentElement.outerHTML;

  /*
   * apply the Chrome view-source style to a line of HTML and append the result to the
   * specified tr
   */
  function appendChromeSourceDecorationContent(sourceViewTr, htmlLine) {
      items = extractItems(htmlLine);

      if(items.length > 0) {
          sourceViewContent = applyChromeSourceDecorationItems(items);
          sourceViewTr.appendChild(sourceViewContent);
      }
  }

  /*
   * returns a new td that display the specified items following
   * the Chrome 'view-source' conventions
   */
  function applyChromeSourceDecorationItems(items) {
      var td = document.createElement("td");
      td.className = "line-content";

      items.forEach(function(item) {
          span = applyChromeSourceDecoration(item);
          td.appendChild(span);
      });

      return td;
  }

  /*
   * returns a span that display the specified item following
   * the Chrome 'view-source' conventions
   */
  function applyChromeSourceDecoration(item) {
      console.log("item", item);
      console.log("lastType", globalLastType);

      var node;
      if((globalLastType == null && beginLikeStandardTag(item)) || globalLastType == "STANDARD_TAG") {
          console.log("-> HTML-TAG");

          RE_ARG = /[a-zA-Z]*[\s]*=[\s]*["']{0,1}[a-zA-Z0-9]*["']{0,1}/; //XXX doesn't allow special chars inside quotes
          argIndex = item.search(RE_ARG);
          if(argIndex == -1) {
              //siple arg: <head>, </head>
              node = createSpan("html-tag", item);
          } else {
                tagItem = item.slice(0, argIndex);
                node = createSpan("html-tag", tagItem);
                console.log("TAG-NAME", tagItem);

                item = item.slice(argIndex);
              while((argIndex = item.search(RE_ARG)) > -1) {
                              //parse args
                xxx = document.createTextNode(item.slice(0, argIndex));
                node.appendChild(xxx);
                console.log("BEFORE", item.slice(0, argIndex));
                item = item.slice(argIndex);

                leftArgIndex = item.search(/[\s=]/);
                leftArg = item.slice(0, leftArgIndex);
                node.appendChild(createSpan("html-attribute-name", leftArg));
                console.log("LEFT-ARG", leftArg);

                item = item.slice(leftArgIndex);

                assignIndex = item.search(/[^=\s"']/);
                assign = item.slice(0, assignIndex);
                node.appendChild(document.createTextNode(assign));
                console.log("ASSIGN", assign);

                item = item.slice(assignIndex);
                valueIndex = item.search(/["'\s/>]/); // XXX:doesn't allow space inside values
                value = item.slice(0, valueIndex);  // XXX:doesnt' allow links
                console.log("VALUE", value);

                //XXX:we can simply use createSpan since Escape
                valueSpan = document.createElement("span");
                valueSpan.className = "html-attribute-value";
                valueSpan.innerHTML = value;
                node.appendChild(valueSpan);

                item = item.slice(valueIndex);
              }

              console.log("ITEM-END", item);
              node.appendChild(document.createTextNode(item));
          }

         if(endsLikeStandardTag(item))
              globalLastType = null;
          else
              globalLastType = "STANDARD_TAG";
      } else if((globalLastType == null && beginLikeComment(item)) || globalLastType == "COMMENT" ) {
          console.log("-> COMMENT");
          node = createSpan("html-comment", item);

          if(endsLikeComment(item))
              globalLastType = null;
            else
              globalLastType = "COMMENT"
      } else {
          console.log("-> PLAIN-TEXT");
          /* if the item isn't a STANDARD_TAG or a COMMENT, is considered*
           * as plain text
           */
          node = document.createTextNode(item); //XXX: mmmhh...encode?
      }
      return node;
  }

  function beginLikeStandardTag(item) {
    var RE_STANDARD_TAG_BEGIN = /^<\/{0,1}[a-zA-Z]+/;
    return RE_STANDARD_TAG_BEGIN.test(item);
  }

  function beginLikeComment(item) {
    var RE_COMMENT_BEGIN = /^<!--/;
    return RE_COMMENT_BEGIN.test(item);
  }

  function endsLikeStandardTag(item) {
    var RE_STANDARD_TAG_END = />$/;
    return RE_STANDARD_TAG_END.test(item);
  }

  function endsLikeComment(item) {
    var RE_COMMENT_END = /-->$/;
    return RE_COMMENT_END.test(item);
  }

  /*
   * returns a list containing all items (TAGS, COMMENT, PLAIN_TEXT, DOCTYPE, ...)
   * in the given string of HTML
   * TODO: simplify maybe with some split
   */
  function extractItems(htmlLine) {
    var currentItem = "";
    var items = [];

    for(c = 0; c < htmlLine.length; c++) {
      ch = htmlLine[c];

      if(beginLikeComment(currentItem) || globalLastType == "COMMENT") {
        if(endsLikeComment(currentItem)) {
            items.push(currentItem);
            currentItem = "";
        }
      } else
          //XXX: what if <,> are between quotes?
          if(currentItem.slice(-1) == ">" || ch == "<") {
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

  /*
   * Returns a new span with the given className and content
   */
  function createSpan(className, content) {
    var span = document.createElement("span");
    span.className = className;
    span.innerHTML = htmlEscape(content);
    return span;
  }

  function appendChromeSourceDecorationNumber(sourceViewTr, number) {
      var td = document.createElement("td");
      td.className = "line-number";
      td.setAttribute("value", number.toString());

      sourceViewTr.appendChild(td);
  }

  /* returns a tbody element of the table added to `doc'.
   * the table follows the Chrome view-source convetions
   */
  function appendChromeSourceDecorationTable(doc) {
    var body = doc.getElementsByTagName("body")[0];

    var line_gutter_backdrop = doc.createElement("div");
    line_gutter_backdrop.className = "line-gutter-backdrop";
    body.appendChild(line_gutter_backdrop);

    var table = doc.createElement("table");
    var tbody = doc.createElement("tbody");
    table.appendChild(tbody);
    body.appendChild(table);

    return tbody;
  }

  function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }
}

