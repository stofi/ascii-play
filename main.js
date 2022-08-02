import { run } from '/src/run.js'
import * as program from '/program.js'

run(program, { element: document.querySelector('pre') })
  .then(function (e) {
    console.log(e)
  })
  .catch(function (e) {
    console.warn(e.message)
    console.log(e.error)
  })
