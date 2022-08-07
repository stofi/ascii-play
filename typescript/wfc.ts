/**
@author kurishutofu
@title  Wave Function Collapse
@version 0.0.6
@description Implementation of the Wave Function Collapse algorithm.
@url https://github.com/stofi/ascii-play/

# How to use
Click to start, collapse a slot or to restart.

# Older versions
- 0.0.3: https://play.ertdfgcvb.xyz/#/1659698366218
- 0.0.4: https://play.ertdfgcvb.xyz/#/1659704759466
- 0.0.5: https://play.ertdfgcvb.xyz/#/1659719329521

*/

const DISABLE_FLASHING = true;

const TILES_3x3 = false;
const TILES_EMOJI = true;

const TILES_SINGLE = false;
const TILES_DOUBLE = false;
const TILES_FULL = false;
const TILES_DOUBLE_SINGLE = false;
const TILES_FULL_SINGLE = false;

export const settings = {
  backgroundColor: "#1133ae",
  color: "white",
  // fontFamily: "Noto Color Emoji",
  // letterSpacing: "-0.17em",
  // fps: 10,
};

// type Socket = 0 | 1 | 2 | 3 | 4 | 5;
type Socket = string;

interface Sockets {
  top: Socket;
  bottom: Socket;
  left: Socket;
  right: Socket;
}

type TemplateSocket = number[] | number;

const templateSocketToSocket = (templateSocket: TemplateSocket): Socket => {
  if (Array.isArray(templateSocket)) {
    return templateSocket.slice().sort().join("");
  }
  return templateSocket.toString();
};

class Tile {
  color: number | string;
  char: string;
  sockets: Sockets;
  weight?: number;
  constructor(
    char: string,
    top: TemplateSocket,
    right: TemplateSocket,
    bottom: TemplateSocket,
    left: TemplateSocket,
    color = 0,
    weight?: number
  ) {
    this.char = char;
    this.weight = weight;
    this.sockets = {
      top: templateSocketToSocket(top),
      right: templateSocketToSocket(right),
      bottom: templateSocketToSocket(bottom),
      left: templateSocketToSocket(left),
    };
    this.color = color;
  }
}

type Template =
  | [
      string,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      string | number,
      number
    ]
  | [
      string,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      string | number
    ];

const templates: Template[] = [
  // [".", 0, 0, 0, 0, 0]
];

enum SocketType {
  Water = 1,
  WaterBeach = 2,
  BeachWater = 3,
  Beach = 4,
  Land = 5,
  Sand = 6,
}
// █ ▓ ▒ ░

// ╱ ╲ ╳
if (TILES_EMOJI) {
  templates.push(
    [
      `░▒
░▒`,
      SocketType.WaterBeach,
      SocketType.Beach,
      SocketType.WaterBeach,
      SocketType.Water,
      "yellow",
      4,
    ],
    [
      `░░
▒▒`,
      SocketType.Water,
      SocketType.WaterBeach,
      SocketType.Beach,
      SocketType.WaterBeach,
      "yellow",
      4,
    ],
    [
      `▒░
▒░`,
      SocketType.BeachWater,
      SocketType.Water,
      SocketType.BeachWater,
      SocketType.Beach,
      "yellow",
      4,
    ],
    [
      `▒▒
░░`,
      SocketType.Beach,
      SocketType.BeachWater,
      SocketType.Water,
      SocketType.BeachWater,
      "yellow",
      4,
    ],
    [
      `▒▒
░▒`,
      SocketType.Beach,
      SocketType.Beach,
      SocketType.WaterBeach,
      SocketType.BeachWater,
      "yellow",
      1,
    ],
    [
      `░▒
▒▒`,
      SocketType.WaterBeach,
      SocketType.Beach,
      SocketType.Beach,
      SocketType.WaterBeach,
      "yellow",
      1,
    ],
    [
      `▒░
▒▒`,
      SocketType.BeachWater,
      SocketType.WaterBeach,
      SocketType.Beach,
      SocketType.Beach,
      "yellow",
      1,
    ],
    [
      `▒▒
▒░`,
      SocketType.Beach,
      SocketType.BeachWater,
      SocketType.BeachWater,
      SocketType.Beach,
      "yellow",
      1,
    ],
    [
      `░░
▒░`,
      SocketType.Water,
      SocketType.Water,
      SocketType.BeachWater,
      SocketType.WaterBeach,
      "yellow",
      3,
    ],
    [
      `▒░
░░`,
      SocketType.BeachWater,
      SocketType.Water,
      SocketType.Water,
      SocketType.BeachWater,
      "yellow",
      2,
    ],
    [
      `░▒
░░`,
      SocketType.WaterBeach,
      SocketType.BeachWater,
      SocketType.Water,
      SocketType.Water,
      "yellow",
      2,
    ],
    [
      `░░
░▒`,
      SocketType.Water,
      SocketType.WaterBeach,
      SocketType.WaterBeach,
      SocketType.Water,
      "yellow",
      2,
    ],
    [
      `░░
░░`,
      SocketType.Water,
      SocketType.Water,
      SocketType.Water,
      SocketType.Water,
      "blue",
      32,
    ],
    [
      `▒▒
▒▒`,
      SocketType.Beach,
      SocketType.Beach,
      SocketType.Beach,
      SocketType.Beach,
      "yellow",
      8,
    ],
    [
      `▒▓
▓▒`,
      SocketType.Land,
      SocketType.Land,
      SocketType.Land,
      SocketType.Land,
      "darkgreen",
      4,
    ],
    [
      `▓▒
▒▓`,
      [SocketType.Beach, SocketType.Land, SocketType.Sand],
      [SocketType.Beach, SocketType.Land, SocketType.Sand],
      [SocketType.Beach, SocketType.Land, SocketType.Sand],
      [SocketType.Beach, SocketType.Land, SocketType.Sand],
      "yellow",
      4,
    ],
    [
      `▓▓
▓▓`,
      [SocketType.Beach, SocketType.Land],
      [SocketType.Beach, SocketType.Land],
      [SocketType.Beach, SocketType.Land],
      [SocketType.Beach, SocketType.Land],
      "green",
      16,
    ]
  );
}
if (TILES_3x3) {
  templates.push(
    [
      `│..
│..
│..`,
      [1, 3],
      0,
      [1, 3],
      0,
      1,
      16,
    ],
    [
      `───
...
...`,
      0,
      [1, 3],
      0,
      [1, 3],
      1,
      16,
    ],
    [
      `╮..
│..
│..`,
      0,
      0,
      1,
      1,
      1,
      4,
    ],
    [
      `╭──
│..
│..`,
      0,
      1,
      1,
      0,
      1,
      4,
    ],
    [
      `╯..
...
...`,
      1,
      0,
      0,
      1,
      1,
      4,
    ],
    [
      `╰──
...
...`,
      1,
      1,
      0,
      0,
      1,
      4,
    ],
    [
      `┃..
┃..
┃..`,
      3,
      0,
      3,
      0,
      3,
      2,
    ],
    [
      `━━━
...
...`,
      0,
      3,
      0,
      3,
      3,
      2,
    ]
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

type Direction = "top" | "right" | "bottom" | "left";

class Library {
  // @ts-ignore
  static map = new Map(templates.map((t) => [t[0], new Tile(...t)]));
  static get tiles() {
    return [...Library.map.values()];
  }
  static reverseDirection(direction: Direction): Direction {
    return direction === "top"
      ? "bottom"
      : direction === "right"
      ? "left"
      : direction === "bottom"
      ? "top"
      : direction === "left"
      ? "right"
      : direction;
  }
  static getValidTilesForSocketsInDirection(
    sockets: Socket[],
    direction: Direction,
    tileset = Library.tiles
  ) {
    if (!sockets || !sockets.length) return [...tileset];

    const validTiles = tileset.filter((tile) =>
      sockets.some((socket) => {
        if (!socket.length) return false;
        const otherSockets = tile.sockets[Library.reverseDirection(direction)];
        if (socket.length == 1) {
          return otherSockets.includes(socket[0]);
        }
        const mySockets = socket.split("");
        return mySockets.some((mySocket) => otherSockets.includes(mySocket));
      })
    );
    // const validTiles = tileset.filter((tile) =>
    //   sockets.includes(tile.sockets[Library.reverseDirection(direction)])
    // );
    return validTiles;
  }

  static getValidTiles({
    top,
    right,
    bottom,
    left,
  }: {
    top: Socket[];
    right: Socket[];
    bottom: Socket[];
    left: Socket[];
  }) {
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
  static compare(
    a: { getEntropy: () => number },
    b: { getEntropy: () => number }
  ) {
    if (!a || !a.getEntropy) return 1;
    if (!b || !b.getEntropy) return -1;
    return a.getEntropy() - b.getEntropy();
  }
  tiles: Tile[];
  x: number;
  y: number;
  collapsed: boolean;
  constructor(x: number, y: number, tiles: Tile[]) {
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
  collapse(id: number | undefined) {
    this.collapsed = true;
    const choosen = this.tiles[id as number];
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
  static pickRandomSlot(slots: Slot[]) {
    return slots[Math.floor(Math.random() * slots.length)];
  }
  map: Map<string, Slot>;
  size: { width: number; height: number };
  collapsedThisGen: Slot[];
  done = false;
  constructor() {
    this.map = new Map();
    this.size = {
      width: 0,
      height: 0,
    };
    this.collapsedThisGen = [];
  }
  clear() {
    this.map.clear();
  }
  get(x: number, y: number) {
    return this.map.get(`${x},${y}`);
  }
  set(x: number, y: number, slot: Slot) {
    this.map.set(`${x},${y}`, slot);
  }

  initialize({ cols, rows }: { cols: number; rows: number }) {
    this.done = false;
    this.size.width = cols;
    this.size.height = rows;
    this.clear();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.set(i, j, new Slot(i, j, this.library.tiles));
      }
    }
    console.log(this.library);

    this.fillBorder(12);
  }
  fillBorder(tileId: number) {
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
  collapseSlot(x: number, y: number, id?: number | undefined) {
    const slot = this.get(x, y);
    if (!slot || slot.collapsed) return;
    slot.collapse(id);
    this.collapsedThisGen.push(slot);
  }

  collapseSlotManual(x: number, y: number, id?: number) {
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
  updateSlotOptions(x: number, y: number, slot: Slot) {
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
      valid.push(new Tile(" ", 0, 0, 0, 0));
    }

    slot.tiles = valid;
  }
  createNewGeneration() {
    const nextGeneration = new Map();
    const set = (x: number, y: number, slot: Slot) =>
      nextGeneration.set(`${x},${y}`, slot);
    const isInRange = (slot: Slot, r = 3) => {
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
        const slot = this.get(i, j);
        if (!slot) continue;
        const clone = slot.clone();
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

interface Context {
  cols: number;
  rows: number;
  frame: number;
}
interface Cursor {
  x: number;
  y: number;
  pressed: boolean;
}
interface Coord {
  x: number;
  y: number;
}

class Experience {
  map = new WFC();
  clicked = false;
  clickStart:
    | {
        x: number;
        y: number;
      }
    | undefined;
  clickEnd:
    | {
        x: number;
        y: number;
      }
    | undefined;
  clickHandled = true;
  running = false;
  started = false;
  frameRandom = 0;
  enableBanner = false;
  tileScale = 2;
  libIndex = 0;
  constructor() {
    // on scroll log if up or down
    document.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        this.increaseLibIndex();
      } else {
        this.decreaseLibIndex();
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

  handleClick(x: number, y: number) {
    this.clicked = true;
    this.clickStart = { x: ~~x, y: ~~y };
    this.clickEnd = undefined;
  }
  handleRelease(x: number, y: number) {
    this.clickEnd = { x: ~~x, y: ~~y };
    this.clicked = false;
    this.clickHandled = false;
  }
  convertCoord(x2: number, y2: number) {
    return [~~(x2 / this.tileScale), ~~(y2 / this.tileScale)];
  }
  getCoordDiff(x2: number, y2: number) {
    const [x1, y1] = this.convertCoord(x2, y2);
    const xd = x2 - x1 * this.tileScale;
    const yd = y2 - y1 * this.tileScale;
    return [xd, yd];
  }
  banner({ cols, rows }: Context) {
    if (!this.enableBanner) return;
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

  pre(
    { cols: cols2, rows: rows2, frame }: Context,
    { x: x2, y: y2, pressed }: Cursor
  ) {
    const [cols, rows] = this.convertCoord(cols2, rows2);
    const [x, y] = this.convertCoord(x2, y2);
    this.frameRandom = Math.random();
    if (this.map.size.width !== cols || this.map.size.height !== rows) {
      this.map.initialize({ cols, rows });
      this.banner({ cols, rows, frame });
      this.running = false;
    }
    if (this.running) {
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
        this.libIndex
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
  post(
    { cols, rows, frame }: Context,
    { x: x2, y: y2, pressed }: Cursor,
    buffer: any[]
  ) {
    const [x, y] = this.convertCoord(x2, y2);
    const index = ~~x * 2 + ~~y * 2 * cols;

    buffer[index] = {
      char: Library.tiles[this.libIndex].char[0],
      color: Library.tiles[this.libIndex].color,
    };
    buffer[index + 1] = {
      char: Library.tiles[this.libIndex].char[1],
      color: Library.tiles[this.libIndex].color,
    };
    buffer[index + cols] = {
      char: Library.tiles[this.libIndex].char[3],
      color: Library.tiles[this.libIndex].color,
    };
    buffer[index + cols + 1] = {
      char: Library.tiles[this.libIndex].char[4],
      color: Library.tiles[this.libIndex].color,
    };
    buffer[0] = { char: this.libIndex > 10 ? "1" : "0", color: 0xffffff };
    buffer[1] = { char: this.libIndex % 10 };
  }

  main({ x: x2, y: y2 }: Coord, { cols: cols2, rows: rows2 }: Context) {
    const [cols, rows] = this.convertCoord(cols2, rows2);
    const [x, y] = this.convertCoord(x2, y2);
    const [xd, yd] = this.getCoordDiff(x2, y2);
    let char = null;

    const slot = this.map.get(x, y);
    if (!slot || !slot.tiles || !slot.tiles.length) return " ";
    const index = !DISABLE_FLASHING ? ~~(slot.tiles.length * Math.random()) : 0;
    let slotChar = !slot.collapsed
      ? slot.tiles[index].char
      : slot.tiles[0].char;
    if (slotChar.length > 1) {
      const lines = slotChar.split("\n");
      // pad the lines to the same length
      const maxLength = Math.max(...lines.map((line) => line.length));
      const paddedLines = lines.map((line) => line.padEnd(maxLength, " "));
      const pLy = lines.length;
      const pLx = paddedLines[0].length;
      // find xd and yd in the lines, modulate by pLx and pLy
      const yd2 = xd % pLy;
      const xd2 = yd % pLx;
      // get the char at the xd and yd
      slotChar = paddedLines[xd2][yd2];
    }
    const v =
      ~~((slot ? slot.getEntropy() / this.map.library.tiles.length : 0) * 10) /
      10;

    const out = {
      char: char && !slot.collapsed ? char : v == 1 ? " " : slotChar,
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
      if (typeof slot.tiles[0].color === "string") {
        out.color = slot.tiles[0].color;
      }
    }
    return out;
  }
}

const experience = new Experience();

export function pre(context: Context, cursor: Cursor) {
  experience.pre(context, cursor);
}
export function main(coord: Coord, context: Context) {
  return experience.main(coord, context);
}
export function post(context: Context, cursor: Cursor, buffer: any[]) {
  experience.post(context, cursor, buffer);
}
