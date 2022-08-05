import { run } from "/src/run.js";
import * as program from "/experiments/wfc";

run(program, { element: document.querySelector("pre") })
    .then(function (e) {})
    .catch(function (e) {
        console.warn(e.message);
        console.log(e.error);
    });
