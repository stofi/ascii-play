/**
@author kurishutofu
@title  Wave Function Collapse
@version 0.0.5
@description Implementation of the Wave Function Collapse algorithm.
@url https://github.com/stofi/ascii-play/

# How to use
Click to start, collapse a slot or to restart.

# Older versions
- 0.0.3: https://play.ertdfgcvb.xyz/#/1659698366218
- 0.0.4: https://play.ertdfgcvb.xyz/#/1659704759466

*/

const DISABLE_FLASHING = false;
const TILES_SINGLE = true;
const TILES_DOUBLE = true;
const TILES_FULL = true;
const TILES_DOUBLE_SINGLE = false;
const TILES_FULL_SINGLE = false;

export const settings = {
    backgroundColor: "#03071e",
    color: "#ffba08",
    restoreState: false,
    fontSize: "2rem",
    // fps: 10,
};

class Tile {
    constructor(char, top, right, bottom, left, color = 0, weight) {
        this.char = char;
        this.weight = weight;
        this.sockets = {
            top,
            right,
            bottom,
            left,
        };
        this.color = color;
    }
}

const templates = [
    [" ", 0, 0, 0, 0, 0],
    // ["H", 0, 4, 0, 0, 0],
    // ["E", 0, 5, 0, 4, 0],
    // ["L", 0, 6, 0, 5, 0],
    // ["O", 0, 0, 0, 6, 0],
];

if (TILES_SINGLE) {
    templates.push(
        ["┐", 0, 0, 1, 1, 1],
        ["┌", 0, 1, 1, 0, 1],
        ["┘", 1, 0, 0, 1, 1],
        ["└", 1, 1, 0, 0, 1],
        ["┼", 1, 1, 1, 1, 1],
        ["├", 1, 1, 1, 0, 1],
        ["┤", 1, 0, 1, 1, 1],
        ["┴", 1, 1, 0, 1, 1],
        ["┬", 0, 1, 1, 1, 1],
        ["│", 1, 0, 1, 0, 1, 100],
        ["─", 0, 1, 0, 1, 1, 100],
        ["╮", 0, 0, 1, 1, 1],
        ["╭", 0, 1, 1, 0, 1],
        ["╯", 1, 0, 0, 1, 1],
        ["╰", 1, 1, 0, 0, 1]
    );
}
if (TILES_DOUBLE) {
    templates.push(
        ["╗", 0, 0, 2, 2, 2],
        ["╔", 0, 2, 2, 0, 2],
        ["╝", 2, 0, 0, 2, 2],
        ["╚", 2, 2, 0, 0, 2],
        ["╬", 2, 2, 2, 2, 2],
        ["╠", 2, 2, 2, 0, 2],
        ["╣", 2, 0, 2, 2, 2],
        ["╩", 2, 2, 0, 2, 2],
        ["╦", 0, 2, 2, 2, 2],
        ["║", 2, 0, 2, 0, 2, 60],
        ["═", 0, 2, 0, 2, 2, 60]
    );
}
if (TILES_DOUBLE_SINGLE) {
    templates.push(
        ["╕", 0, 0, 1, 2, 2],
        ["╒", 0, 2, 1, 0, 2],
        ["╛", 1, 0, 0, 2, 2],
        ["╘", 1, 2, 0, 0, 2],
        ["╪", 1, 2, 1, 2, 2],
        ["╞", 1, 2, 1, 0, 2],
        ["╡", 1, 0, 1, 2, 2],
        ["╧", 1, 2, 0, 2, 2],
        ["╤", 0, 2, 1, 2, 2],
        ["╖", 0, 0, 2, 1, 2],
        ["╓", 0, 1, 2, 0, 2],
        ["╜", 2, 0, 0, 1, 2],
        ["╙", 2, 1, 0, 0, 2],
        ["╫", 2, 1, 2, 1, 2],
        ["╟", 2, 1, 2, 0, 2],
        ["╢", 2, 0, 2, 1, 2],
        ["╨", 2, 1, 0, 1, 2],
        ["╥", 0, 1, 2, 1, 2]
    );
}
if (TILES_FULL) {
    templates.push(
        ["┓", 0, 0, 3, 3, 3],
        ["┏", 0, 3, 3, 0, 3],
        ["┛", 3, 0, 0, 3, 3],
        ["┗", 3, 3, 0, 0, 3],
        ["╋", 3, 3, 3, 3, 3],
        ["┣", 3, 3, 3, 0, 3],
        ["┫", 3, 0, 3, 3, 3],
        ["┻", 3, 3, 0, 3, 3],
        ["┳", 0, 3, 3, 3, 3],
        ["┃", 3, 0, 3, 0, 3, 40],
        ["━", 0, 3, 0, 3, 3, 40]
    );
}
if (TILES_FULL_SINGLE) {
    templates.push(
        ["┮", 0, 3, 1, 1, 3],
        ["┭", 0, 1, 1, 3, 3],
        ["┵", 1, 1, 0, 3, 3],
        ["┶", 1, 3, 0, 1, 3],
        ["╼", 0, 3, 0, 1, 3],
        ["╾", 0, 1, 0, 3, 3],
        ["╽", 1, 0, 3, 0, 3],
        ["╿", 3, 0, 1, 0, 3],
        ["┑", 0, 0, 1, 3, 3],
        ["┍", 0, 3, 1, 0, 3],
        ["┙", 1, 0, 0, 3, 3],
        ["┕", 1, 3, 0, 0, 3],
        ["┿", 1, 3, 1, 3, 3],
        ["┝", 1, 3, 1, 0, 3],
        ["┥", 1, 0, 1, 3, 3],
        ["┷", 1, 3, 0, 3, 3],
        ["┯", 0, 3, 1, 3, 3],
        ["┒", 0, 0, 3, 1, 3],
        ["┎", 0, 1, 3, 0, 3],
        ["┚", 3, 0, 0, 1, 3],
        ["┖", 3, 1, 0, 0, 3],
        ["╂", 3, 1, 3, 1, 3],
        ["┠", 3, 1, 3, 0, 3],
        ["┨", 3, 0, 3, 1, 3],
        ["┸", 3, 1, 0, 1, 3],
        ["┰", 0, 1, 3, 1, 3],
        ["╇", 3, 3, 1, 3, 3],
        ["╈", 1, 3, 3, 3, 3],
        ["╉", 3, 1, 3, 3, 3],
        ["╊", 3, 3, 3, 1, 3],
        ["╃", 3, 1, 1, 3, 3],
        ["╄", 3, 3, 1, 1, 3],
        ["╅", 1, 1, 3, 3, 3],
        ["╆", 1, 3, 3, 1, 3],
        ["┽", 1, 1, 1, 3, 3],
        ["┾", 1, 3, 1, 1, 3],
        ["╀", 3, 1, 1, 1, 3],
        ["╁", 1, 1, 1, 1, 3],
        ["┡", 3, 3, 1, 0, 3],
        ["┢", 1, 3, 3, 0, 3],
        ["┩", 3, 0, 1, 3, 3],
        ["┪", 1, 0, 3, 3, 3],
        ["┞", 3, 1, 3, 0, 3],
        ["┟", 1, 1, 3, 0, 3],
        ["┦", 3, 0, 1, 1, 3],
        ["┧", 1, 0, 3, 1, 3]
    );
}

class Library {
    static map = new Map(templates.map((t) => [t[0], new Tile(...t)]));
    static get tiles() {
        return [...Library.map.values()];
    }
    static reverseDirection(direction) {
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
    static getValidTilesForSocketsInDirection(
        sockets,
        direction,
        tileset = Library.tiles
    ) {
        if (!sockets || !sockets.length) return [...tileset];

        const validTiles = tileset.filter((tile) =>
            sockets.includes(tile.sockets[Library.reverseDirection(direction)])
        );
        return validTiles;
    }

    static getValidTiles({ top, right, bottom, left }) {
        const topTiles = Library.getValidTilesForSocketsInDirection(
            [...new Set(top)],
            "bottom"
        );
        const rightTiles = Library.getValidTilesForSocketsInDirection(
            [...new Set(right)],
            "left",
            topTiles
        );

        const bottomTiles = Library.getValidTilesForSocketsInDirection(
            [...new Set(bottom)],
            "top",
            rightTiles
        );
        const leftTiles = Library.getValidTilesForSocketsInDirection(
            [...new Set(left)],
            "right",
            bottomTiles
        );
        return leftTiles;
    }
    get tiles() {
        return Library.tiles;
    }
}

class Slot {
    static compare(a, b) {
        if (!a || !a.getEntropy) return 1;
        if (!b || !b.getEntropy) return -1;
        return a.getEntropy() - b.getEntropy();
    }

    constructor(x, y, tiles) {
        this.x = x;
        this.y = y;
        this.collapsed = false;
        this.tiles = tiles;
    }
    getEntropy() {
        return this.tiles.length;
    }
    getRandomOption() {
        const options = this.tiles
            .map((tile) => new Array(tile.weight).fill(tile))
            .flat();
        return options[Math.floor(Math.random() * options.length)];
    }
    collapse(id) {
        this.collapsed = true;
        const choosen = this.tiles[id];
        if (!choosen) {
            this.tiles = [this.getRandomOption()];
        } else {
            this.tiles = [choosen];
        }
    }

    clone() {
        const clone = new Slot(this.x, this.y, this.tiles);
        clone.collapsed = this.collapsed;
        return clone;
    }
}

class WFC {
    library = new Library();
    static pickRandomSlot(slots) {
        return slots[Math.floor(Math.random() * slots.length)];
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
    set(x, y, slot) {
        this.map.set(`${x},${y}`, slot);
    }

    initialize({ cols, rows }) {
        this.done = false;
        this.size.x = cols;
        this.size.y = rows;
        this.clear();
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.set(i, j, new Slot(i, j, this.library.tiles));
            }
        }
    }
    collapseSlot(x, y, id = null) {
        const slot = this.get(x, y);
        if (slot.collapsed) return;
        slot.collapse(id);
        this.collapsedThisGen.push(slot);
    }

    collapseSlotManual(x, y) {
        const slot = this.get(x, y);
        if (slot.collapsed) return;
        this.updateSlotOptions(x, y, slot);
        this.collapseSlot(x, y);
    }
    getSortedSlots() {
        return [...this.map.values()]
            .filter((slot) => !slot.collapsed)
            .sort(Slot.compare);
    }
    getSlotsWithLowestEntropy() {
        const sorted = this.getSortedSlots();
        if (sorted.length === 0) {
            this.done = true;
            return [];
        }
        const lowest = sorted[0].getEntropy();
        return sorted.filter((slot) => slot.getEntropy() === lowest);
    }
    updateSlotOptions(x, y, slot) {
        // if (!slot) return;
        const empty = this.library.tiles[0];
        const top = this.get(x, y - 1);
        const right = this.get(x + 1, y);
        const bottom = this.get(x, y + 1);
        const left = this.get(x - 1, y);
        const valid = Library.getValidTiles({
            top: top ? top.tiles.map((tile) => tile.sockets.bottom) : [],
            right: right ? right.tiles.map((tile) => tile.sockets.left) : [],
            bottom: bottom ? bottom.tiles.map((tile) => tile.sockets.top) : [],
            left: left ? left.tiles.map((tile) => tile.sockets.right) : [],
        });

        if (valid.length === 0) {
            valid.push(new Tile("x", 0, 0, 0, 0));
        }

        slot.tiles = valid;
    }
    createNewGeneration() {
        const nextGeneration = new Map();
        const set = (x, y, slot) => nextGeneration.set(`${x},${y}`, slot);
        const isInRange = (slot, r = 3) => {
            const { x, y } = slot;
            return this.collapsedThisGen.some(
                (slot) =>
                    slot.x + r >= x &&
                    slot.x - r <= x &&
                    slot.y + r >= y &&
                    slot.y - r <= y
            );
        };

        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.y; j++) {
                const slot = this.get(i, j).clone();
                if (isInRange(slot)) {
                    // this.updateSlotOptions(i, j, slot);
                    if (!slot.collapsed) this.updateSlotOptions(i, j, slot);
                }

                set(i, j, slot);
            }
        }
        this.map = nextGeneration;
        this.collapsedThisGen = [];
    }
    step() {
        this.createNewGeneration();
        const slots = this.getSlotsWithLowestEntropy();

        if (slots.length === 0) return;
        const entropy = slots[0].getEntropy();

        if (entropy === 1) {
            slots.forEach((slot) => this.collapseSlot(slot.x, slot.y));
        } else {
            const random = WFC.pickRandomSlot(slots);
            this.collapseSlot(random.x, random.y);
        }
    }
}

class Experience {
    map = new WFC();
    clicked = false;
    running = false;
    started = false;
    frameRandom = 0;

    banner({ cols, rows }) {
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const text = ["CHAOS TO ORDER", "CLICK TO START"];
                const index = 0;
                const x1 = ~~(cols / 2 - text[index].length / 2);
                const y1 = ~~(rows / 2);
                if (y === y1 && x >= x1 && x < x1 + text[index].length) {
                    // char = text[index][x - x1];
                    const tile = new Tile(text[index][x - x1], 0, 0, 0, 0);
                    this.map.set(x, y, new Slot(x, y, [tile]));
                    this.map.collapseSlot(x, y);
                }
            }
        }
    }

    pre({ cols, rows, frame }, { x, y, pressed }) {
        this.frameRandom = Math.random();
        if (this.map.size.x !== cols || this.map.size.y !== rows) {
            this.map.initialize({ cols, rows });
            this.banner({ cols, rows, frame });
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
                this.banner({ cols, rows, frame });
            }
            this.map.collapseSlotManual(~~x, ~~y);
        } else if (this.clicked && this.running) {
            this.map.collapseSlotManual(~~x, ~~y);
            this.clicked = false;
        }
        if (this.map.done) {
            this.running = false;
        }
    }

    main({ x, y }, { cols, rows }) {
        let char = null;

        const slot = this.map.get(x, y);
        if (!slot || !slot.tiles || !slot.tiles.length) return " ";
        const index = !DISABLE_FLASHING
            ? ~~(slot.tiles.length * Math.random())
            : 0;
        const slotChar = !slot.collapsed
            ? slot.tiles[index].char
            : slot.tiles[0].char;

        const v =
            ~~(
                (slot ? slot.getEntropy() / this.map.library.tiles.length : 0) *
                10
            ) / 10;
        const out = {
            char: char && !slot.collapsed ? char : v == 1 ? "" : slotChar,
            color: slot.collapsed ? settings.color : "gray",
        };
        if (slot.collapsed) {
            // slot.tiles[0].color;
            switch (slot.tiles[0].color) {
                case 1:
                    out.color = "#e85d04";
                    break;
                case 2:
                    out.color = "#dc2f02";
                    break;
                case 3:
                    out.color = "#9d0208";
                    break;
                default:
                    break;
            }
        }
        return out;
    }
}

const experience = new Experience();

export function pre(context, cursor) {
    experience.pre(context, cursor);
}
export function main(coord, context) {
    return experience.main(coord, context);
}
