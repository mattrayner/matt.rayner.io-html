$(document).ready(    ->
  $('#scene').parallax()

  $(window).bind("load resize", ->
    windowReference = $(window)
    windowHeight = $(windowReference).height()
    $('#home-slide, #home-slide ul#scene').css({'height':windowHeight})

    contentHeight = $('#home-slide .content').outerHeight()
    $('#home-slide .content').css({'margin-top': 0-(contentHeight * 0.5)})
  )

  $(window).bind("load", ->
    Waypoint({
      element: $('section#about-me img.rounded-image').first(),
      handler: (direction)->
        alert("50% from the top - #{direction}")
      ,
      offset: '10%'
    })
  )

)
