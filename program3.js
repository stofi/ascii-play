/**
@author kurishutofu
@title  Wave Function Collapse
@version 0.0.1
@description A program to generate a wave function collapse 
*/
export const settings = {
    backgroundColor: "black",
    color: "#fffefc",
    restoreState: false,
    fontSize: "4rem",
    // fps: 15,
};

import * as Vec3 from "/src/modules/vec3.js";
import * as Vec2 from "/src/modules/vec2.js";
import * as DrawBox from "/src/modules/drawbox.js";

const getShade = (f, pattern = "█▇▆▅▄▃▂▁ ") => {
    f = 1 - f;
    let index = Math.floor((pattern.length - 1) * f);

    if (index < 0) index = 0;
    if (index >= pattern.length) index = pattern.length - 1;
    return pattern[index];
};
const createTemplate = (char, top, right, bottom, left) => ({
    char,
    sockets: {
        top,
        right,
        bottom,
        left,
    },
});
const tileLibrary = [
    // 0                t  r  b  l
    createTemplate(" ", 0, 0, 0, 0),
    createTemplate("╗", 0, 0, 2, 2),
    createTemplate("╔", 0, 2, 2, 0),
    createTemplate("╝", 2, 0, 0, 2),
    createTemplate("╚", 2, 2, 0, 0),
    createTemplate("╬", 2, 2, 2, 2),
    createTemplate("╠", 2, 2, 2, 0),
    createTemplate("╣", 2, 0, 2, 2),
    createTemplate("╩", 2, 2, 0, 2),
    createTemplate("╦", 0, 2, 2, 2),
    createTemplate("║", 2, 0, 2, 0),
    createTemplate("═", 0, 2, 0, 2),
    createTemplate("╕", 0, 0, 1, 2),
    createTemplate("╒", 0, 2, 1, 0),
    createTemplate("╛", 1, 0, 0, 2),
    createTemplate("╘", 1, 2, 0, 0),
    createTemplate("╪", 1, 2, 1, 2),
    createTemplate("╞", 1, 2, 1, 0),
    createTemplate("╡", 1, 0, 1, 2),
    createTemplate("╧", 1, 2, 0, 2),
    createTemplate("╤", 0, 2, 1, 2),
    createTemplate("╖", 0, 0, 2, 1),
    createTemplate("╓", 0, 1, 2, 0),
    createTemplate("╜", 2, 0, 0, 1),
    createTemplate("╙", 2, 1, 0, 0),
    createTemplate("╫", 2, 1, 2, 1),
    createTemplate("╟", 2, 1, 2, 0),
    createTemplate("╢", 2, 0, 2, 1),
    createTemplate("╨", 2, 1, 0, 1),
    createTemplate("╥", 0, 1, 2, 1),
    createTemplate("┐", 0, 0, 1, 1),
    createTemplate("┌", 0, 1, 1, 0),
    createTemplate("┘", 1, 0, 0, 1),
    createTemplate("└", 1, 1, 0, 0),
    createTemplate("┼", 1, 1, 1, 1),
    createTemplate("├", 1, 1, 1, 0),
    createTemplate("┤", 1, 0, 1, 1),
    createTemplate("┴", 1, 1, 0, 1),
    createTemplate("┬", 0, 1, 1, 1),
    createTemplate("│", 1, 0, 1, 0),
];

// up is x -1
// right is y +1
// down is x +1
// left is y -1

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collapsed = false;
        this.options = [...tileLibrary];
    }

    getEntropy() {
        return this.options.length;
    }
    getRandomOption() {
        return this.options[Math.floor(Math.random() * this.options.length)];
    }
    collapse(id) {
        this.collapsed = true;
        const choosen = this.options[id];
        if (!choosen) {
            this.options = [this.getRandomOption()];
        } else {
            this.options = [choosen];
        }
    }
    static compare(a, b) {
        if (!a || !a.getEntropy) return 1;
        if (!b || !b.getEntropy) return -1;
        return a.getEntropy() - b.getEntropy();
    }
    static reverse(direction) {
        return direction === "top"
            ? "bottom"
            : direction === "right"
            ? "left"
            : direction === "bottom"
            ? "top"
            : direction === "left"
            ? "right"
            : null;
    }
    getValidTiles(direction) {
        const validSockets = this.options.reduce((acc, curr) => {
            acc = acc.concat(curr.sockets[direction]);
            return acc;
        }, []);
        const deduped = [...new Set(validSockets)];
        // filter tile library to only include valid tiles
        return tileLibrary.filter((tile) => {
            return deduped.includes(tile.sockets[Tile.reverse(direction)]);
        });
    }
    clone() {
        const clone = new Tile(this.x, this.y);
        clone.collapsed = this.collapsed;
        clone.options = [...this.options];
        return clone;
    }
}

class WFC {
    constructor() {
        this.map = new Map();
        this.size = {
            x: 0,
            y: 0,
        };
        this.collapsedThisGen = [];
    }
    clear() {
        this.map.clear();
    }
    get(x, y) {
        return this.map.get(`${x},${y}`);
    }
    set(x, y, tile) {
        this.map.set(`${x},${y}`, tile);
    }
    initialize({ cols, rows }) {
        this.done = false;
        this.size.x = cols;
        this.size.y = rows;
        this.clear();
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.set(i, j, new Tile(i, j));
            }
        }
    }
    collapseTile(x, y, id = null) {
        const tile = this.get(x, y);
        if (tile.collapsed) return;
        tile.collapse(id);
        this.collapsedThisGen.push(tile);
    }
    collapseTileManual(x, y) {
        const tile = this.get(x, y);
        this.setOptions(x, y, tile);
        this.collapseTile(x, y);
    }
    getSortedTiles() {
        return [...this.map.values()]
            .filter((tile) => !tile.collapsed)
            .sort(Tile.compare);
    }
    getTilesWithLowestEntropy() {
        const sorted = this.getSortedTiles();
        if (sorted.length === 0) {
            this.done = true;
            return [];
        }
        const lowest = sorted[0].getEntropy();
        return sorted.filter((tile) => tile.getEntropy() === lowest);
    }
    getLowestEntropy() {
        const sorted = this.getSortedTiles();

        const lowest = sorted[0].getEntropy();
        return lowest;
    }
    static pickRandomTile(tiles) {
        return tiles[Math.floor(Math.random() * tiles.length)];
    }
    getLowestEntropyTile() {
        const tiles = WFC.pickRandomTile(this.getTilesWithLowestEntropy());
        return tiles;
    }
    getRandomUncollapsedTile() {
        const tiles = [...this.map.values()].filter((tile) => !tile.collapsed);
        return WFC.pickRandomTile(tiles);
    }
    setOptions(i, j, tile) {
        const empty = tileLibrary[0];
        const top = this.get(i, j - 1);
        const topValid = top ? top.getValidTiles("bottom") : [empty];
        const right = this.get(i + 1, j);
        const rightValid = right ? right.getValidTiles("left") : [empty];
        const bottom = this.get(i, j + 1);
        const bottomValid = bottom ? bottom.getValidTiles("top") : [empty];
        const left = this.get(i - 1, j);
        const leftValid = left ? left.getValidTiles("right") : [empty];

        const valid = tile.options.filter(
            (tile) =>
                topValid.some((t) => t.char === tile.char) &&
                rightValid.some((t) => t.char === tile.char) &&
                bottomValid.some((t) => t.char === tile.char) &&
                leftValid.some((t) => t.char === tile.char)
        );
        if (valid.length === 0) {
            // valid.push(empty);
            valid.push({
                char: "x",
                sockets: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            });
            // throw new Error("No valid tiles");
        }

        tile.options = valid;
    }
    createNewGeneration(r) {
        const nextGeneration = new Map();
        const set = (x, y, tile) => nextGeneration.set(`${x},${y}`, tile);
        const check = (x, y, i, j) =>
            r != undefined
                ? j < y - r || j > y + r || i < x - r || i > x + r
                : false;
        const inZone = (i, j) =>
            this.collapsedThisGen.some((tile) => check(tile.x, tile.y, i, j));

        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.y; j++) {
                if (inZone(i, j)) {
                    nextGeneration.set(`${i},${j}`, this.get(i, j));
                    continue;
                }
                const tile = this.get(i, j).clone();
                const empty = tileLibrary[0];
                if (!tile.collapsed) {
                    this.setOptions(i, j, tile);
                }

                set(i, j, tile);
            }
        }
        this.map = nextGeneration;
        this.collapsedThisGen = [];
    }
    step() {
        // collapse tiles with entropy of 1

        this.createNewGeneration();
        const tiles = this.getTilesWithLowestEntropy();
        if (tiles.length !== 0) {
            const entropy = tiles[0].getEntropy();

            if (entropy === 1) {
                tiles.forEach((tile) => this.collapseTile(tile.x, tile.y));
            } else {
                const random = WFC.pickRandomTile(tiles);
                this.collapseTile(random.x, random.y);
            }
        }
    }
}

const map = new WFC();
window.map = map;

let clicked = false;
let running = false;
let started = false;

export function pre(context, cursor) {
    const { cols, rows } = context;
    const { x, y } = cursor;
    if (map.size.x !== cols || map.size.y !== rows) {
        map.initialize({ cols, rows });
        running = false;
        // collapse some random tiles to start with
    }
    if (running) {
        map.step();
    }
    if (cursor.pressed) {
        clicked = true;
    } else if (clicked && !running) {
        running = true;
        clicked = false;
        started = true;
        if (map.done) {
            map.initialize({ cols, rows });
        }
        map.collapseTileManual(~~x, ~~y);
    } else if (clicked && running) {
        // running = false;
        map.collapseTileManual(~~x, ~~y);
        clicked = false;
    }
    if (map.done) {
        running = false;
    }

    // const t = map.getLowestEntropyTile();
    // t.collapse();
    // map.createNewGeneration();
}
const options = {
    colorEffects: true,
};
export function main(coord, context) {
    let char = null;
    {
        // started = true;
        const text = "CHAOS TO ORDER";
        // print "Click anywhere to start"
        // in the center of the screen
        const { cols, rows } = context;
        const x = ~~(cols / 2 - text.length / 2);
        const y = ~~(rows / 2);
        if (coord.y === y && coord.x >= x && coord.x < x + text.length) {
            char = text[coord.x - x];
        }
    }
    const { x, y } = coord;
    const tile = map.get(x, y);
    if (!tile) return " ";
    const tileChar = !tile.collapsed
        ? tile.options[~~(tile.options.length * Math.random())].char
        : tile.options[0].char;

    // char = char ? char : getShade(tile.getEntropy() / tileLibrary.length);
    const v = ~~((tile ? tile.getEntropy() / tileLibrary.length : 0) * 10) / 10;
    return {
        char: char && !tile.collapsed ? char : v == 1 ? "" : tileChar,
        // color: options.colorEffects
        //     ? !char && !tile.collapsed
        //         ? `rgba(255,255,255,${1 - v})`
        //         : "white"
        //     : "white",
    };
}
