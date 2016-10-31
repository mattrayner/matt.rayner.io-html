setTimeout(->
  link = document.createElement('a')
  link.href = window.location.href+'/matthew-rayner-tech-lead-cv.pdf'
  link.target = '_blank'
  link.download = 'matthew-rayner-tech-lead-cv.pdf'
  link.dispatchEvent(new MouseEvent('click'))
, 2000)