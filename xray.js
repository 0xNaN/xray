function doXray(sourceId, glassId) {
    sourceView = new SourceView(sourceId);

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
