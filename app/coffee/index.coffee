$(document).ready(    ->
  $('#scene').parallax()

  $(window).bind("load resize", ->
#    windowReference = $(window)
#    windowHeight = $(windowReference).height()
#    $('#home-slide, #home-slide ul#scene').css({'height':windowHeight})

#    contentHeight = $('#home-slide .content').outerHeight()
#    $('#home-slide .content').css({'margin-top': 0-(contentHeight * 0.5)})
  )

)
