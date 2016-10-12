# CoffeeScript that needs to run across/on all pages can go here.

@settings = {
  menuImageWidth: 768,
  menuImageFrames: 16,
  animationFps: 35
}

@app = {
  menuImageAnimationInterval: null,
  activeMenuIconFrame: 1
}

$('.toggle-menu').on('click', (e)->
  e.preventDefault()

  $('#menu,#bd-logo').toggleClass('is-open')

  clearInterval(app.menuImageAnimationInterval)

  menuOpen = $('#menu').hasClass('is-open')

  if menuOpen
    $('body').css({
      "overflow": "hidden",
      "height": "100%"
    })
  else
    $('body').css({
      "overflow": "auto",
      "height": "auto"
    })

  amimateMenuIcon = ->
    if menuOpen
      app.activeMenuIconFrame++

      if app.activeMenuIconFrame > settings.menuImageFrames
        clearInterval(app.menuImageAnimationInterval)
        return
    else
      app.activeMenuIconFrame--

      if app.activeMenuIconFrame <= 0
        clearInterval(app.menuImageAnimationInterval)
        return
        
    $('#svg-menu-image>g, #svg-menu-image>polygon').css('display', 'none')
    $("#frame-#{app.activeMenuIconFrame}").css('display', 'inline-block')

  app.menuImageAnimationInterval = setInterval(
    amimateMenuIcon,
    1000/settings.animationFps
  )
)

$(document).ready(->
  try_to_init_foundation = ->
    if(typeof $(document).foundation != 'undefined')
      clearInterval(init_foundation)
      $(document).foundation()

  init_foundation = setInterval(try_to_init_foundation, 10)
)
