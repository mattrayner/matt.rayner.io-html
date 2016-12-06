$grid = null

$(document).ready(    ->
  $('#scene').parallax()

  $('.filter-button-group').on( 'click', 'button', ->
    filterValue = $(this).attr('data-filter')
    $grid.isotope({ filter: filterValue })
  )

  # Initialise isotope once our css has been loaded
  css_interval = setInterval(->
    element_color = $('.skills li .title').first().css('color')

    color_is_hex = (element_color == '#e5007d')
    color_is_rgb = (element_color == 'rgb(229, 0, 125)')

    if(color_is_hex || color_is_rgb )
      clearInterval(css_interval)

      # Delay for half a second to be sure
      setTimeout(->
        $grid = $('.skills').isotope({
          itemSelector: 'li',
          layoutMode: 'fitRows'
        })
      , 200)

  , 10)
)
