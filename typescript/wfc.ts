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

const DISABLE_FLASHING = false;
const TILES_CUSTOM = true;

const TILES_SINGLE = false;
const TILES_DOUBLE = false;
const TILES_FULL = false;
const TILES_DOUBLE_SINGLE = false;
const TILES_FULL_SINGLE = false;

const COLORS = {
  deepBlue: "#112234",
  gold: "#ffa216",
  redWine: "#4f1528",
};

const COLOR_BG = COLORS.deepBlue;
const COLOR_FG = COLORS.gold;
const COLOR_1 = COLORS.gold;
const COLOR_2 = "#0f0";
const COLOR_3 = COLORS.redWine;

export const settings = {
  backgroundColor: COLOR_BG,
  color: COLOR_FG,
  restoreState: false,
  fontSize: "2rem",
  // fps: 1,
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
  color: number;
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
      number,
      number
    ]
  | [
      string,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      TemplateSocket,
      number
    ];

const templates: Template[] = [[" ", 0, 0, 0, 0, 0]];

if (TILES_CUSTOM) {
  templates.push(
    ["│", [1, 3], 0, [1, 3], 0, 1, 16],
    ["─", 0, [1, 3], 0, [1, 3], 1, 16],
    ["╮", 0, 0, 1, 1, 1, 4],
    ["╭", 0, 1, 1, 0, 1, 4],
    ["╯", 1, 0, 0, 1, 1, 4],
    ["╰", 1, 1, 0, 0, 1, 4],
    ["┃", 3, 0, 3, 0, 3, 2],
    ["━", 0, 3, 0, 3, 3, 2]
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
  collapse(id: number | null) {
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
  }
  collapseSlot(x: number, y: number, id = null) {
    const slot = this.get(x, y);
    if (!slot || slot.collapsed) return;
    slot.collapse(id);
    this.collapsedThisGen.push(slot);
  }

  collapseSlotManual(x: number, y: number) {
    const slot = this.get(x, y);
    if (!slot) return;
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
      valid.push(new Tile("x", 0, 0, 0, 0));
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

  pre({ cols, rows, frame }: Context, { x, y, pressed }: Cursor) {
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
      this.map.collapseSlotManual(this.clickEnd?.x ?? 0, this.clickEnd?.y ?? 0);
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

  main({ x, y }: Coord, { cols, rows }: Context) {
    let char = null;

    const slot = this.map.get(x, y);
    if (!slot || !slot.tiles || !slot.tiles.length) return " ";
    const index = !DISABLE_FLASHING ? ~~(slot.tiles.length * Math.random()) : 0;
    const slotChar = !slot.collapsed
      ? slot.tiles[index].char
      : slot.tiles[0].char;

    const v =
      ~~((slot ? slot.getEntropy() / this.map.library.tiles.length : 0) * 10) /
      10;
    const out = {
      char: char && !slot.collapsed ? char : v == 1 ? "" : slotChar,
      color: slot.collapsed ? settings.color : "gray",
    };
    if (slot.collapsed) {
      // slot.tiles[0].color;
      switch (slot.tiles[0].color) {
        case 1:
          out.color = COLOR_1;
          break;
        case 2:
          out.color = COLOR_2;
          break;
        case 3:
          out.color = COLOR_3;
          break;
        default:
          break;
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
