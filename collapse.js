/**
@author kurishutofu
@title  Wave Function Collapse
@version 0.0.2
@description Implementation of the Wave Function Collapse algorithm. 

Click to start, collapse a tile or to restart.

*/
export const settings = {
    backgroundColor: "black",
    color: "#fffefc",
    restoreState: false,
    fontSize: "2rem",
    fps: 10,
};

class Tile {
    static get library() {
        const seed = (char, top, right, bottom, left) => ({
            char,
            sockets: {
                top,
                right,
                bottom,
                left,
            },
        });

        return [
            seed(" ", 0, 0, 0, 0),
            seed("╗", 0, 0, 2, 2),
            seed("╔", 0, 2, 2, 0),
            seed("╝", 2, 0, 0, 2),
            seed("╚", 2, 2, 0, 0),
            seed("╬", 2, 2, 2, 2),
            seed("╠", 2, 2, 2, 0),
            seed("╣", 2, 0, 2, 2),
            seed("╩", 2, 2, 0, 2),
            seed("╦", 0, 2, 2, 2),
            seed("║", 2, 0, 2, 0),
            seed("═", 0, 2, 0, 2),
            seed("╕", 0, 0, 1, 2),
            seed("╒", 0, 2, 1, 0),
            seed("╛", 1, 0, 0, 2),
            seed("╘", 1, 2, 0, 0),
            seed("╪", 1, 2, 1, 2),
            seed("╞", 1, 2, 1, 0),
            seed("╡", 1, 0, 1, 2),
            seed("╧", 1, 2, 0, 2),
            seed("╤", 0, 2, 1, 2),
            seed("╖", 0, 0, 2, 1),
            seed("╓", 0, 1, 2, 0),
            seed("╜", 2, 0, 0, 1),
            seed("╙", 2, 1, 0, 0),
            seed("╫", 2, 1, 2, 1),
            seed("╟", 2, 1, 2, 0),
            seed("╢", 2, 0, 2, 1),
            seed("╨", 2, 1, 0, 1),
            seed("╥", 0, 1, 2, 1),
            seed("┐", 0, 0, 1, 1),
            seed("┌", 0, 1, 1, 0),
            seed("┘", 1, 0, 0, 1),
            seed("└", 1, 1, 0, 0),
            seed("┼", 1, 1, 1, 1),
            seed("├", 1, 1, 1, 0),
            seed("┤", 1, 0, 1, 1),
            seed("┴", 1, 1, 0, 1),
            seed("┬", 0, 1, 1, 1),
            seed("│", 1, 0, 1, 0),
        ];
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collapsed = false;
        this.options = [...Tile.library];
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
    getValidTiles(direction) {
        const validSockets = new Set();
        this.options.forEach((option) => {
            if (option.sockets[direction] !== undefined)
                validSockets.add(option.sockets[direction]);
        });
        return Tile.library.filter((tile) =>
            [...validSockets].includes(tile.sockets[Tile.reverse(direction)])
        );
    }
    clone() {
        const clone = new Tile(this.x, this.y);
        clone.collapsed = this.collapsed;
        clone.options = [...this.options];
        return clone;
    }
}

class WFC {
    static pickRandomTile(tiles) {
        return tiles[Math.floor(Math.random() * tiles.length)];
    }
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
        this.updateTileOptions(x, y, tile);
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
    updateTileOptions(i, j, tile) {
        // if (!tile) return;
        const empty = Tile.library[0];
        const top = this.get(i, j - 1);
        const right = this.get(i + 1, j);
        const bottom = this.get(i, j + 1);
        const left = this.get(i - 1, j);
        const topValid = top ? top.getValidTiles("bottom") : [empty];
        const rightValid = right ? right.getValidTiles("left") : [empty];
        const bottomValid = bottom ? bottom.getValidTiles("top") : [empty];
        const leftValid = left ? left.getValidTiles("right") : [empty];

        const valid = tile.options.filter(
            (tile) =>
                topValid.some((t) => t.char === tile.char) &&
                rightValid.some((t) => t.char === tile.char) &&
                bottomValid.some((t) => t.char === tile.char) &&
                leftValid.some((t) => t.char === tile.char)
        );
        if (valid.length === 0) {
            valid.push({
                char: "x",
                sockets: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            });
        }

        tile.options = valid;
    }
    createNewGeneration() {
        const nextGeneration = new Map();
        const set = (x, y, tile) => nextGeneration.set(`${x},${y}`, tile);

        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.y; j++) {
                const tile = this.get(i, j).clone();
                if (!tile.collapsed) this.updateTileOptions(i, j, tile);

                set(i, j, tile);
            }
        }
        this.map = nextGeneration;
        this.collapsedThisGen = [];
    }
    step() {
        this.createNewGeneration();
        const tiles = this.getTilesWithLowestEntropy();

        if (tiles.length === 0) return;
        const entropy = tiles[0].getEntropy();

        if (entropy === 1) {
            tiles.forEach((tile) => this.collapseTile(tile.x, tile.y));
        } else {
            const random = WFC.pickRandomTile(tiles);
            this.collapseTile(random.x, random.y);
        }
    }
}

class Experience {
    map = new WFC();
    clicked = false;
    running = false;
    started = false;

    pre({ cols, rows }, { x, y, pressed }) {
        if (this.map.size.x !== cols || this.map.size.y !== rows) {
            this.map.initialize({ cols, rows });
            this.running = false;
        }
        if (this.running) {
            this.map.step();
        }
        if (pressed) {
            this.clicked = true;
        } else if (this.clicked && !this.running) {
            this.running = true;
            this.clicked = false;
            this.started = true;
            if (this.map.done) {
                this.map.initialize({ cols, rows });
            }
            this.map.collapseTileManual(~~x, ~~y);
        } else if (this.clicked && this.running) {
            this.map.collapseTileManual(~~x, ~~y);
            this.clicked = false;
        }
        if (this.map.done) {
            this.running = false;
        }
    }

    main({ x, y }, { cols, rows }) {
        let char = null;

        const text = "CHAOS TO ORDER";
        const x1 = ~~(cols / 2 - text.length / 2);
        const y1 = ~~(rows / 2);
        if (y === y1 && x >= x1 && x < x1 + text.length) {
            char = text[x - x1];
        }

        const tile = this.map.get(x, y);
        if (!tile) return " ";
        const tileChar = !tile.collapsed
            ? tile.options[~~(tile.options.length * Math.random())].char
            : tile.options[0].char;

        const v =
            ~~((tile ? tile.getEntropy() / Tile.library.length : 0) * 10) / 10;
        return {
            char: char && !tile.collapsed ? char : v == 1 ? "" : tileChar,
        };
    }
}

const experience = new Experience();
window.experience = experience;
export function pre(context, cursor) {
    experience.pre(context, cursor);
}
export function main(coord, context) {
    return experience.main(coord, context);
}
