;(function (){
  // we want as little noise in our innerHtml ass possibile
  var source = document.createElement('pre')
  source.id = 'view-source-code'
  source.className = 'prettyprint'
  source.innerHTML = ('<!doctype html>\n<html>\n' + document.documentElement.innerHTML + '\n</html>').replace(/[<>]/g, function (m) { return {'<':'&lt;','>':'&gt;'}[m]})
  // it's cool if the user knows how to use the tool, right
  var help = document.createElement('div')
  help.id = 'view-source-help'
  help.innerHTML = '&lt;drag me around&gt;'
  // then we create the hand which wraps the whole content
  var handle = document.createElement('div')
  handle.id = 'view-source-handle'
  handle.appendChild(source)
  handle.appendChild(help)
  // last but not least we load and add the prettifier to the dom
  var prettyprint = document.createElement('script')
  prettyprint.src = 'google-code-prettify/run_prettify.js?autoload=true&amp;lang=html';
  document.body.appendChild(handle)
  document.body.appendChild(prettyprint)
  // attch/detach drag events to handle
  handle.addEventListener('mousedown', function (){
    handle.classList.add('drag')
    window.addEventListener('mousemove', move, true)
  }, false)
  window.addEventListener('mouseup', function (){
    handle.classList.remove('drag')
    window.removeEventListener('mousemove', move, true)
  }, true)
  // define how components should behave while moved
  function move (event){
    var h = handle.offsetHeight / 2
      , w = handle.offsetWidth / 2
      , t = (event.pageY - h)
      , l = (event.pageX - w)
    handle.style.top = px(t)
    handle.style.left = px(l)
    source.style.top = px(t < 0 ? Math.abs(t) : '-' + t)
    source.style.left = px(l < 0 ? Math.abs(l) : '-' + l)
  }
  function px(unit){
    return unit + 'px'
  }
})()
