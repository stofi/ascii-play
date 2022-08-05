/**
@author kurishutofu
@title  Raymarch
@version 0.0.1
@url https://github.com/stofi/ascii-play/

Distance functions are based on Inigo Quilez https://iquilezles.org/articles/distfunctions/

# Older versions
- 0.0.1: https://play.ertdfgcvb.xyz/#/1659700093933
*/
export const settings = {
    backgroundColor: "#323132",
    color: "#fffefc",
    once: false,
    fps: 30,
    restoreState: false,
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

const getNormal = (p, t = 0) => {
    const eps = Vec2.vec2(0.0001, 0);
    const xyy = Vec3.vec3(eps.x, eps.y, eps.y);
    const yxy = Vec3.vec3(eps.y, eps.x, eps.y);
    const yyx = Vec3.vec3(eps.y, eps.y, eps.x);

    return Vec3.mulN(
        Vec3.norm(
            Vec3.vec3(
                sdf(Vec3.add(p, xyy), t) - sdf(Vec3.sub(p, xyy), t),
                sdf(Vec3.add(p, yxy), t) - sdf(Vec3.sub(p, yxy), t),
                sdf(Vec3.add(p, yyx), t) - sdf(Vec3.sub(p, yyx), t)
            )
        ),
        0.5
    );
};

const mat4 = (...args) => {
    return [...args];
};

const vec3RotationMatrix = (v, a) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    const vx = v.x;
    const vy = v.y;
    const vz = v.z;
    return [
        c + vx * vx * (1 - c),
        vx * vy * (1 - c) - vz * s,
        vx * vz * (1 - c) + vy * s,
        0,
        vy * vx * (1 - c) + vz * s,
        c + vy * vy * (1 - c),
        vy * vz * (1 - c) - vx * s,
        0,
        vz * vx * (1 - c) - vy * s,
        vz * vy * (1 - c) + vx * s,
        c + vz * vz * (1 - c),
        0,
        0,
        0,
        0,
        1,
    ];
};
const vec3Transform = (v, m) => {
    const vx = v.x;
    const vy = v.y;
    const vz = v.z;
    return Vec3.vec3(
        vx * m[0] + vy * m[4] + vz * m[8],
        vx * m[1] + vy * m[5] + vz * m[9],
        vx * m[2] + vy * m[6] + vz * m[10]
    );
};
const vec3Rotate = (v, a, axis) => {
    const m = vec3RotationMatrix(axis, a);
    return vec3Transform(v, m);
};
const sdSphere = (p, s) => Vec3.length(p) - s;

const sdTorus = (p, t) => {
    const pxz = Vec2.vec2(p.x, p.z);
    const py = p.y;
    const tx = t.x;
    const ty = t.y;
    const q = Vec2.vec2(Vec2.length(pxz) - tx, py);
    return Vec2.length(q) - ty;
};

const sdBox = (p, b) => {
    const q = Vec3.sub(Vec3.abs(p), b);
    const qx = Vec3.vec3(q.x, q.x, q.x);
    const qy = Vec3.vec3(q.y, q.y, q.y);
    const qz = Vec3.vec3(q.z, q.z, q.z);

    return Math.abs(
        Vec3.length(Vec3.max(q, Vec3.vec3(0, 0, 0))) +
            Vec3.length(
                Vec3.min(Vec3.max(qx, Vec3.max(qy, qz)), Vec3.vec3(0, 0, 0))
            )
    );
};

const sdRoundBox = (p, b, r) => {
    const q = Vec3.sub(Vec3.abs(p), b);
    const qx = Vec3.vec3(q.x, q.x, q.x);
    const qy = Vec3.vec3(q.y, q.y, q.y);
    const qz = Vec3.vec3(q.z, q.z, q.z);
    return Math.abs(
        Vec3.length(Vec3.max(q, Vec3.vec3(0, 0, 0))) +
            Vec3.length(
                Vec3.min(Vec3.max(qx, Vec3.max(qy, qz)), Vec3.vec3(0, 0, 0))
            ) -
            r
    );
};

const mix = (a, b, k) => {
    return a * (1 - k) + b * k;
};
const clamp = (a, b, c) => {
    return Math.max(b, Math.min(a, c));
};
const smin = (a, b, k) => {
    const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
    return mix(b, a, h) - k * h * (1 - h);
};

const _sdf = (p, t = 0) => {
    let pos = Vec3.copy(p);
    pos.z += 2;
    const time = (f) => smin(f, 0, 0.1) * 3 + 1;
    const bs = time(Math.sin(t) - 0.5);
    const ss = time(Math.sin(t + (2 * Math.PI) / 3) - 0.5);
    const ts = time(Math.sin(t - (2 * Math.PI) / 3) - 0.5);
    let p1 = vec3Rotate(pos, t / 5, Vec3.vec3(1, 0, 0));
    p1 = vec3Rotate(p1, t, Vec3.vec3(0, 1, 0));
    p1 = vec3Rotate(p1, t / 3, Vec3.vec3(0, 0, 1));
    const box = sdRoundBox(p1, Vec3.mulN(Vec3.vec3(1, 1, 1), bs), 0.1);
    const sphere = sdSphere(p1, 1.2 * ss);
    const torus = sdTorus(p1, Vec2.mulN(Vec2.vec2(0.8, 0.3), ts));
    let d = smin(sphere, box, 0.5);
    d = smin(d, torus, 0.5);
    // closest object
    let name = null;
    if (torus < sphere && torus < box) {
        name = "torus";
    }
    if (sphere < torus && sphere < box) {
        name = "sphere";
    }
    if (box < sphere && box < torus) {
        name = "box";
    }

    return {
        distance: d,
        object: name,
    };
};
const sdf = (p, t = 0) => _sdf(p, t).distance;

const vec3toHexColor = (v) => {
    const r = Math.floor(v.x * 127) + 128;
    const g = Math.floor(v.y * 127) + 128;
    const b = Math.floor(v.z * 127) + 128;
    const pad = (n) => {
        return n.toString(16).padStart(2, "0");
    };
    const hex = `#${pad(r)}${pad(g)}${pad(b)}`;
    const isValid = /^#[0-9a-f]{6}$/i.test(hex);
    return isValid ? hex : "black";
};

function raymarch(coord, context, time, pattern) {
    const symbol = typeof pattern == "object" ? pattern.default : pattern;
    const H = context.rows / 50;
    const t0 = time;
    const uv = Vec2.vec2(
        (coord.x + 1) / context.cols,
        (coord.y + 1) / context.rows
    );
    const aspect = Vec2.norm(Vec2.vec2(context.width, context.height));
    const newUv = Vec2.addN(Vec2.mul(Vec2.subN(uv, 0.5), aspect), 0.5);
    let centeredUv = Vec2.addN(newUv, -0.5);
    centeredUv.y *= -1;
    centeredUv = Vec2.mulN(centeredUv, H);
    const camPos = Vec3.vec3(0, 0, 4);
    const ray = Vec3.norm(Vec3.vec3(centeredUv.x, centeredUv.y, -1));

    let t = 0;
    const tMax = 16;
    let min = 20;
    let max = 0;
    let char = " ";
    let color = "#fff";
    let fontWeight = 400;
    let object = "default";
    for (let i = 0; i < 32; i++) {
        const pos = Vec3.add(camPos, Vec3.mulN(ray, t));
        const { distance, object: oName } = _sdf(pos, t0);
        object = oName ?? object;
        const h = distance;
        if (h < 0.1 || t > tMax) break;

        t += h;
        max = h;
        min = h < min ? h : min;
    }
    if (t < tMax) {
        const pos = Vec3.add(camPos, Vec3.mulN(ray, t));
        const normal = getNormal(pos, t0);

        color = vec3toHexColor(normal);
        const lightPos = Vec3.vec3(3, 5, 2);
        const diff = Vec3.dot(lightPos, normal);
        const objectPattern =
            typeof pattern == "object" ? pattern[object] : symbol;
        char =
            Math.random() > diff * 0.5 + 0.5
                ? objectPattern.toLowerCase()
                : objectPattern;
        color = vec3toHexColor(normal);
        fontWeight = diff > 2 ? 700 : diff < -2 ? 300 : 400;
    }
    return { char, color, fontWeight };
}

function fillPattern(coord, context, pattern = "ABC") {
    if (pattern.length > context.cols) {
        const lines = pattern.split("").reduce((acc, c, i) => {
            if (i % context.cols == 0) {
                acc.push(c);
            } else {
                acc[acc.length - 1] += c;
            }
            return acc;
        }, []);
        pattern = lines[coord.y % lines.length];
    }
    const index = (coord.x + coord.y) % pattern.length;
    return pattern[index];
}
export function main(coord, context) {
    const t0 = context.time * 0.0003 * (settings.fps / 30);
    let char = " ";
    let rayMarchPattern = fillPattern(coord, context, "RAYMARCHING");
    let boxPattern = fillPattern(coord, context, "BOX");
    let spherePattern = fillPattern(coord, context, "SPHERE");
    let torusPattern = fillPattern(coord, context, "TORUS");
    char = raymarch(coord, context, t0, {
        default: rayMarchPattern,
        box: boxPattern,
        sphere: spherePattern,
        torus: torusPattern,
    });
    if (colorWasDisabled)
        return char.char
            ? {
                  ...char,
                  color: "white",
                  fontWeight: 400,
              }
            : {
                  char,
                  color: "white",
                  fontWeight: 400,
              };
    return colorEnabled ? char : char.char ? char.char : char;
}

let colorEnabled = false;
let guiEnabled = false;
let colorWasDisabled = false;
let wasPressed = false;

export function post(context, cursor, buffer) {
    const text = `X
Font effects: ${!colorEnabled ? "○" : "◉"}
Frame: ${context.frame}`;
    const width = 30;
    const height = 5;
    const paddingX = 2;
    const paddingY = 1;
    const x = 2;
    const y = 1;
    colorWasDisabled = false;
    // curor in bounds
    const cursorInBounds =
        cursor.x >= x &&
        cursor.x < x + width &&
        cursor.y >= y &&
        cursor.y < y + height;
    const cursorLine = Math.floor(cursor.y - y) - 1;
    // cursor pressed
    const cursorPressed = cursor.pressed && cursorInBounds;

    if (!wasPressed && cursorPressed) {
        wasPressed = true;
        console.log("pressed");
        if (!guiEnabled) {
            if (cursorLine == 0) {
                guiEnabled = true;
                console.log("GUI enabled");
            }
        } else if (cursorLine == 1) {
            colorEnabled = !colorEnabled;
            colorWasDisabled = colorEnabled;
        } else if (cursorLine == 0) {
            guiEnabled = false;
        }
    }
    if (!cursor.pressed) {
        wasPressed = false;
    }

    const style = {
        width,
        height,
        paddingX,
        paddingY,
        x,
        y,
        color: settings.color,
        backgroundColor: settings.backgroundColor,
        borderStyle: "round",
        shadowStyle: "light",
    };

    const target = buffer;
    const targetCols = context.cols;
    const targetRows = context.rows;
    if (guiEnabled) {
        DrawBox.drawBox(text, style, target, targetCols, targetRows);
    } else {
        const index = x + paddingX + (y + paddingY) * context.cols;
        buffer[index] = { char: "?" };
    }
}
