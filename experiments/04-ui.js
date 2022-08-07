/**
@author kurishutofu
@title  UI
@version 0.0.1
@url https://github.com/stofi/ascii-play/


# Older versions

*/
export const settings = {
    backgroundColor: "#323132",
    color: "#fffefc",
};

import * as Vec3 from "/src/modules/vec3.js";
import * as Vec2 from "/src/modules/vec2.js";
import * as DrawBox from "/src/modules/drawbox.js";

const getShade = (f, pattern) => {
    f *= -1;
    let index = Math.floor((pattern.length - 1) * f);

    if (index < 0) return null;
    if (index >= pattern.length) index = pattern.length - 1;
    return pattern[index];
};

export function main(coord, context) {
    return "x";
}

let colorEnabled = false;
let guiEnabled = false;
let colorWasDisabled = false;
let wasPressed = false;

const windowFactory = (context, cursor, buffer) => {
    const options = {
        text: `x`,
    };
    const getTextDimensions = (text) => {
        const dimensions = {
            width: 4,
            height: 3,
        };
        if (!text || text.length === 0) return dimensions;
        const isMultiline = text.match("\n");
        if (isMultiline) {
            const lines = text.split("\n");
            dimensions.height = lines.length + 2;
            dimensions.width =
                Math.max(...lines.map((line) => line.length)) + 4;
        } else {
            dimensions.width = text.length + 4;
        }
        return dimensions;
    };
    return {
        options,
        draw() {
            const style = {
                // paddingX: 3,
                // paddingY: 3,
                ...getTextDimensions(options.text),
                color: settings.color,
                backgroundColor: settings.backgroundColor,
                borderStyle: "round",
                shadowStyle: "light",
            };
            DrawBox.drawBox(
                options.text,
                style,
                buffer,
                context.cols,
                context.rows
            );
        },
    };
};

export function post(context, cursor, buffer) {
    const window = windowFactory(context, cursor, buffer);
    // window.options.text = "test";
    window.draw();
}
