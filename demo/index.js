import ElementSticky from '../src/index'

const wrap = document.getElementsByClassName('table-wrap')[0]
const table = document.getElementsByTagName('table')[0]
const head = document.getElementsByTagName('thead')[0]

const esH = new ElementSticky({
  container: wrap,
  target: table,
  action: 'hScrollSticky',
  offset: 0
})

const esTop = new ElementSticky({
  container: wrap,
  target: head,
  action: 'topSticky',
  offset: 0
})
