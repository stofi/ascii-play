import * as raymarch from "/experiments/01-raymarch";
import * as waves from "/experiments/02-waves";
import * as wfc from "/experiments/03-wfc";
import * as Run from "/src/run.js";

const mode = import.meta.env.MODE;
let program = null;

switch (mode) {
    case "raymarch":
        program = raymarch;
        break;
    case "waves":
        program = waves;
        break;
    case "wfc":
        program = wfc;
        break;
    default:
        program = raymarch;
        break;
}

Run.run(program, { element: document.querySelector("pre") })
    .then(function (e) {})
    .catch(function (e) {
        console.warn(e.message);
        console.log(e.error);
    });
