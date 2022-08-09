/**
@author kurishutofu
@title  Wave Function Collapse
@version 0.0.6
@desc Implementation of the Wave Function Collapse algorithm.
@url https://github.com/stofi/ascii-play/

# Classes
## Tile
Tile describes a single character in the grid. It has sockets that describe how it connects to other tiles. Optionally it can have a custom color and weight.

## Library
The library is a collection of tiles that can be used to create a grid. It contains utility methods for comparing tiles.

## Slot
Slot is a single cell in the grid. It has a list of possible tiles that starts
with all possible tiles and gets reduced by the wave function collapse algorithm. The number of possible tiles is the slots entropy. 

## WFC
The WFC class is the core of the algorithm. This version of WFC doesn't restart when it find an invalid solution, instead it just places an ampty tile in the grid.
Every step it generates a new generation of slots with updated possible tiles (only updating slots within range of the collapsed ones to avoid unnecessary updates.) All the slots with entropy 1 are marked as collapsed if there are none, one slot with lowest entropy is selected and collapsed randomly. If there are none uncollapsed slots, the algorithm is done.

## Experience
This class is responsible for for rendering the grid and connecting the algorithm to the play code.

# How to use
Click to collapse a slot use scroll wheel to select a different tile to place.

# Older versions
- 0.0.3: https://play.ertdfgcvb.xyz/#/1659698366218
- 0.0.4: https://play.ertdfgcvb.xyz/#/1659704759466
- 0.0.5: https://play.ertdfgcvb.xyz/#/1659719329521

*/

const DISABLE_FLASHING = false;

const TILES_2X2 = true;
const TILES_2X2_FULL = true;

const TILES_SINGLE = false;
const TILES_DOUBLE = false;
const TILES_FULL = false;
const TILES_DOUBLE_SINGLE = false;
const TILES_FULL_SINGLE = false;

export const settings = {
    backgroundColor: "#03071e",
    color: "#ffba08",
    fontWeight: "700",
    fontSize: "2em",
};

// out.color = "#e85d04";
// break;
// case 2:
// out.color = "#dc2f02";
// break;
// case 3:
// out.color = "#9d0208";
class Tile {
    static getSocket(templateSocket) {
        if (Array.isArray(templateSocket)) {
            return templateSocket.slice().sort().join("");
        }

        return templateSocket.toString();
    }
    constructor(char, top, right, bottom, left, color = null, weight = 1) {
        this.char = char;
        this.weight = weight;

        this.sockets = {
            top: Tile.getSocket(top),
            right: Tile.getSocket(right),
            bottom: Tile.getSocket(bottom),
            left: Tile.getSocket(left),
        };
        this.color = color;
    }
}

const templates = [[" ", 0, 0, 0, 0, 0]];
let tileSize = 1;

if (TILES_2X2) {
    tileSize = 2;

    templates.push(
        ["──\n  ", 0, 1, 0, 1, "#e85d04", 300],
        ["│ \n│ ", 1, 0, 1, 0, "#e85d04", 100],
        ["╮ \n│ ", 0, 0, 1, 1, "#e85d04", 10],
        ["╭─\n│ ", 0, 1, 1, 0, "#e85d04", 10],
        ["╯ \n  ", 1, 0, 0, 1, "#e85d04", 10],
        ["╰─\n  ", 1, 1, 0, 0, "#e85d04", 10]
    );
}

if (TILES_2X2_FULL) {
    tileSize = 2;

    templates.push(
        ["━━\n  ", 0, 3, 0, 3, "#dc2f02", 30],
        ["┃ \n┃ ", 3, 0, 3, 0, "#dc2f02", 10],
        ["┏━\n┃ ", 0, 3, 3, 0, "#dc2f02"],
        ["┗━\n  ", 3, 3, 0, 0, "#dc2f02"],
        ["┓ \n┃ ", 0, 0, 3, 3, "#dc2f02"],
        ["┛ \n  ", 3, 0, 0, 3, "#dc2f02"],
        ["┣━\n┃ ", 3, 3, 3, 0, "#dc2f02"],
        ["┫ \n┃ ", 3, 0, 3, 3, "#dc2f02"],
        ["┻━\n  ", 3, 3, 0, 3, "#dc2f02"],
        ["┳━\n┃ ", 0, 3, 3, 3, "#dc2f02"]
    );
}

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
        ["│", 1, 0, 1, 0, 1, 10],
        ["─", 0, 1, 0, 1, 1, 10],
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
        ["║", 2, 0, 2, 0, 2, 10],
        ["═", 0, 2, 0, 2, 2, 10]
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
        ["┃", 3, 0, 3, 0, 3, 10],
        ["━", 0, 3, 0, 3, 3, 10]
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
            sockets.some((socket) => {
                if (!socket.length) return false;

                const otherSockets =
                    tile.sockets[Library.reverseDirection(direction)];

                if (socket.length == 1) {
                    return otherSockets.includes(socket[0]);
                }
                const mySockets = socket.split("");

                return mySockets.some((mySocket) =>
                    otherSockets.includes(mySocket)
                );
            })
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
            width: 0,
            height: 0,
        };
        this.collapsedThisGen = [];
        this.done = false;
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
        this.size.width = cols;
        this.size.height = rows;
        this.clear();

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.set(i, j, new Slot(i, j, this.library.tiles));
            }
        }
    }
    fillBorder(tileId) {
        const tile = this.library.tiles[tileId];
        if (!tile) return;

        for (let i = 0; i < this.size.width; i++) {
            this.collapseSlot(i, 0, tileId);
            this.collapseSlot(i, this.size.height - 1, tileId);
        }

        for (let i = 0; i < this.size.height; i++) {
            this.collapseSlot(0, i, tileId);
            this.collapseSlot(this.size.width - 1, i, tileId);
        }
    }
    collapseSlot(x, y, id = null) {
        const slot = this.get(x, y);
        if (!slot || slot.collapsed) return;
        slot.collapse(id);
        this.collapsedThisGen.push(slot);
    }

    collapseSlotManual(x, y, id = null) {
        const slot = this.get(x, y);
        if (!slot) return;
        if (slot.collapsed) return;
        this.updateSlotOptions(x, y, slot);
        this.collapseSlot(x, y, id);
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
        // const empty = this.library.tiles[0];
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
            valid.push(new Tile("╳", 0, 0, 0, 0, "red"));
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

        for (let i = 0; i < this.size.width; i++) {
            for (let j = 0; j < this.size.height; j++) {
                const slot = this.get(i, j).clone();

                if (isInRange(slot)) {
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
    clickStart = null;
    clickEnd = null;
    clickHandled = true;
    running = false;
    started = false;
    frameRandom = 0;
    enableBanner = false;
    tileSize = 2;
    libIndex = 0;
    paused = false;

    constructor(tileSize = 1) {
        this.tileSize = tileSize;

        document.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                this.increaseLibIndex();
            } else {
                this.decreaseLibIndex();
            }
        });

        document.addEventListener("keydown", (e) => {
            // if key space
            if (e.key === " ") {
                this.paused = !this.paused;
            }
        });
    }
    increaseLibIndex() {
        this.libIndex++;

        if (this.libIndex >= Library.tiles.length) {
            this.libIndex = 0;
        }
    }
    decreaseLibIndex() {
        this.libIndex--;

        if (this.libIndex < 0) {
            this.libIndex = Library.tiles.length - 1;
        }
    }

    handleClick(x, y) {
        this.clicked = true;
        this.clickStart = { x: ~~x, y: ~~y };
        this.clickEnd = undefined;
    }
    handleRelease(x, y) {
        this.clickEnd = { x: ~~x, y: ~~y };
        this.clicked = false;
        this.clickHandled = false;
    }
    convertCoord(x2, y2) {
        return [~~(x2 / this.tileSize), ~~(y2 / this.tileSize)];
    }
    getCoordDiff(x2, y2) {
        const [x1, y1] = this.convertCoord(x2, y2);
        const xd = x2 - x1 * this.tileSize;
        const yd = y2 - y1 * this.tileSize;

        return [~~xd, ~~yd];
    }

    banner({ cols, rows }) {
        if (!this.enableBanner) return;
        const index = Math.random() > 0.8 ? 0 : 1;

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const text = ["CHAOS TO ORDER", "CLICK TO START"];
                const x1 = ~~(cols / 2 - text[index].length / 2);
                const y1 = ~~(rows / 2);

                if (y === y1 && x >= x1 && x < x1 + text[index].length) {
                    const tile = new Tile(text[index][x - x1], 0, 0, 0, 0);
                    this.map.set(x, y, new Slot(x, y, [tile]));
                    this.map.collapseSlot(x, y);
                }
            }
        }
    }

    pre({ cols: cols2, rows: rows2, frame }, { x: x2, y: y2, pressed }) {
        const [cols, rows] = this.convertCoord(cols2 + 1, rows2 + 1);
        const [x, y] = this.convertCoord(x2, y2);
        this.frameRandom = Math.random();

        if (this.map.size.width !== cols || this.map.size.height !== rows) {
            this.map.initialize({ cols, rows });
            this.banner({ cols, rows, frame });
            this.running = false;
        }

        if (this.running && !this.paused) {
            this.map.step();
        }

        if (!this.clickHandled) {
            if (!this.running) {
                this.running = true;
                this.started = true;

                if (this.map.done) {
                    this.map.initialize({ cols, rows });
                    this.banner({ cols, rows, frame });
                }
            }

            this.map.collapseSlot(
                this.clickEnd?.x ?? 0,
                this.clickEnd?.y ?? 0,
                this.libIndex !== 0 ? this.libIndex : undefined
            );
            this.clickHandled = true;
        }

        if (this.map.done) {
            this.running = false;
        }

        if (pressed && !this.clicked) {
            this.handleClick(x, y);
        } else if (this.clicked) {
            this.handleRelease(x, y);
        }
    }
    post({ cols }, { x: x2, y: y2 }, buffer) {
        const [x, y] = this.convertCoord(x2, y2);
        const index = ~~x * this.tileSize + ~~y * this.tileSize * cols;
        const tile = Library.tiles[this.libIndex];
        const slot = this.map.get(x, y);
        let color = "white";
        if (!slot) return;
        if (slot.collapsed) color = "black";

        if (this.libIndex === 0) {
            return;
        }

        for (let i = 0; i < this.tileSize; i++) {
            for (let j = 0; j < this.tileSize; j++) {
                buffer[index + i * cols + j] = {
                    color,
                    char: this.getChar(tile.char, j, i),
                };
            }
        }
    }

    getChar(tileChar, xd, yd) {
        let char = tileChar.length === 1 ? tileChar : tileChar[0];
        const length = this.tileSize * this.tileSize + (this.tileSize - 1);

        if (tileChar.length === length) {
            const lines = tileChar.split("\n");
            // pad the lines to the same length
            const maxLength = Math.max(...lines.map((line) => line.length));

            const paddedLines = lines.map((line) =>
                line.padEnd(maxLength, " ")
            );
            const pLy = lines.length;
            const pLx = paddedLines[0].length;
            // find xd and yd in the lines, modulate by pLx and pLy
            const yd2 = xd % pLy;
            const xd2 = yd % pLx;
            // get the char at the xd and yd

            char = paddedLines[xd2][yd2];
        }
        if (!char) debugger;

        return char;
    }

    main({ x: x2, y: y2 }) {
        const [x, y] = this.convertCoord(x2, y2);
        const [xd, yd] = this.getCoordDiff(x2, y2);
        let char = null;

        const slot = this.map.get(x, y);
        if (!slot || !slot.tiles || !slot.tiles.length) return " ";

        const index = !DISABLE_FLASHING
            ? ~~(slot.tiles.length * Math.random())
            : 0;
        let slotChar = !slot.collapsed
            ? slot.tiles[index].char
            : slot.tiles[0].char;

        slotChar = this.getChar(slotChar, xd, yd);

        const v =
            ~~(
                (slot ? slot.getEntropy() / this.map.library.tiles.length : 0) *
                10
            ) / 10;

        const out = {
            char: char && !slot.collapsed ? char : v == 1 ? " " : slotChar,
            color: slot.collapsed ? settings.color : "gray",
        };

        if (slot.collapsed) {
            if (typeof slot.tiles[0].color === "string") {
                out.color = slot.tiles[0].color;
            }
        }

        return out;
    }
}

const experience = new Experience(tileSize);

export function pre(context, cursor) {
    experience.pre(context, cursor);
}

export function main(coord, context) {
    return experience.main(coord, context);
}

export function post(context, cursor, buffer) {
    experience.post(context, cursor, buffer);
}
