$grid = null

$(document).ready(    ->
  $('#scene').parallax()

  $('#about-me-expand-heading').on('click', ->
    $(this).toggleClass('minus')
  )

  $grid = $('.skills').isotope({
    itemSelector: 'li',
    layoutMode: 'fitRows',
  })

)
