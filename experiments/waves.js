/**
@author kurishutofu
@title  Waves
@version 0.0.1
@url https://github.com/stofi/ascii-play/

# Older versions
- 0.0.0: https://play.ertdfgcvb.xyz/#/1659700118738

*/
export const settings = {
    backgroundColor: "#323132",
    color: "#fffefc",
};

import * as Vec3 from "/src/modules/vec3.js";
import * as Vec2 from "/src/modules/vec2.js";
import * as DrawBox from "/src/modules/drawbox.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm";

const perlinNoise3d = (function () {
    // Based on http://mrl.nyu.edu/~perlin/noise/
    // Adapting from runemadsen/rune.noise.js
    // Which was adapted from P5.js
    // Which was adapted from PApplet.java
    // which was adapted from toxi
    // which was adapted from the german demo group farbrausch as used in their demo "art": http://www.farb-rausch.de/fr010src.zip

    var PERLIN_YWRAPB = 4;
    var PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
    var PERLIN_ZWRAPB = 8;
    var PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
    var PERLIN_SIZE = 4095;

    var SINCOS_PRECISION = 0.5;
    var SINCOS_LENGTH = Math.floor(360 / SINCOS_PRECISION);
    var sinLUT = new Array(SINCOS_LENGTH);
    var cosLUT = new Array(SINCOS_LENGTH);
    var DEG_TO_RAD = Math.PI / 180.0;
    for (var i = 0; i < SINCOS_LENGTH; i++) {
        sinLUT[i] = Math.sin(i * DEG_TO_RAD * SINCOS_PRECISION);
        cosLUT[i] = Math.cos(i * DEG_TO_RAD * SINCOS_PRECISION);
    }

    var perlin_PI = SINCOS_LENGTH;
    perlin_PI >>= 1;

    var Noise = function () {
        this.perlin_octaves = 4; // default to medium smooth
        this.perlin_amp_falloff = 0.5; // 50% reduction/octave
        this.perlin = null;
    };

    Noise.prototype = {
        noiseSeed: function (seed) {
            // Linear Congruential Generator
            // Variant of a Lehman Generator
            var lcg = (function () {
                // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
                // m is basically chosen to be large (as it is the max period)
                // and for its relationships to a and c
                var m = 4294967296,
                    // a - 1 should be divisible by m's prime factors
                    a = 1664525,
                    // c and m should be co-prime
                    c = 1013904223,
                    seed,
                    z;
                return {
                    setSeed: function (val) {
                        // pick a random seed if val is undefined or null
                        // the >>> 0 casts the seed to an unsigned 32-bit integer
                        z = seed =
                            (val == null ? Math.random() * m : val) >>> 0;
                    },
                    getSeed: function () {
                        return seed;
                    },
                    rand: function () {
                        // define the recurrence relationship
                        z = (a * z + c) % m;
                        // return a float in [0, 1)
                        // if z = m then z / m = 0 therefore (z % m) / m < 1 always
                        return z / m;
                    },
                };
            })();

            lcg.setSeed(seed);
            this.perlin = new Array(PERLIN_SIZE + 1);
            for (var i = 0; i < PERLIN_SIZE + 1; i++) {
                this.perlin[i] = lcg.rand();
            }
            return this;
        },

        get: function (x, y, z) {
            y = y || 0;
            z = z || 0;

            if (this.perlin == null) {
                this.perlin = new Array(PERLIN_SIZE + 1);
                for (var i = 0; i < PERLIN_SIZE + 1; i++) {
                    this.perlin[i] = Math.random();
                }
            }

            if (x < 0) {
                x = -x;
            }
            if (y < 0) {
                y = -y;
            }
            if (z < 0) {
                z = -z;
            }

            var xi = Math.floor(x),
                yi = Math.floor(y),
                zi = Math.floor(z);
            var xf = x - xi;
            var yf = y - yi;
            var zf = z - zi;
            var rxf, ryf;

            var r = 0;
            var ampl = 0.5;

            var n1, n2, n3;

            var noise_fsc = function (i) {
                // using cosine lookup table
                return (
                    0.5 *
                    (1.0 - cosLUT[Math.floor(i * perlin_PI) % SINCOS_LENGTH])
                );
            };

            for (var o = 0; o < this.perlin_octaves; o++) {
                var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

                rxf = noise_fsc(xf);
                ryf = noise_fsc(yf);

                n1 = this.perlin[of & PERLIN_SIZE];
                n1 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n1);
                n2 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
                n2 +=
                    rxf *
                    (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
                n1 += ryf * (n2 - n1);

                of += PERLIN_ZWRAP;
                n2 = this.perlin[of & PERLIN_SIZE];
                n2 += rxf * (this.perlin[(of + 1) & PERLIN_SIZE] - n2);
                n3 = this.perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
                n3 +=
                    rxf *
                    (this.perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
                n2 += ryf * (n3 - n2);

                n1 += noise_fsc(zf) * (n2 - n1);

                r += n1 * ampl;
                ampl *= this.perlin_amp_falloff;
                xi <<= 1;
                xf *= 2;
                yi <<= 1;
                yf *= 2;
                zi <<= 1;
                zf *= 2;

                if (xf >= 1.0) {
                    xi++;
                    xf--;
                }
                if (yf >= 1.0) {
                    yi++;
                    yf--;
                }
                if (zf >= 1.0) {
                    zi++;
                    zf--;
                }
            }
            return r;
        },
    };

    return Noise;
})();

const getShade = (f, pattern = "█▇▆▅▄▃▂▁") => {
    f = 1 - f;
    let index = Math.floor((pattern.length - 1) * f);

    if (index < 0) index = 0;
    if (index >= pattern.length) index = pattern.length - 1;
    return pattern[index];
};

const p3d = new perlinNoise3d();

const mapRange = (
    value,
    min1 = 0,
    max1 = 1,
    min2 = 0,
    max2 = 1,
    clamp = true
) => {
    if (clamp) {
        if (value < min1) value = min1;
        if (value > max1) value = max1;
    }
    return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
};

// const options = {
//     timeScale: 1,
//     waveFrequency: 0.2,
//     waveTime: 0.6,
//     noiseScale: 0.1,
//     power: 1.2,
//     amplitude: 0.8,
//     frequency: 0.1,
//     noiseFactor: 7,
// };
const options = {
    timeScale: 1,
    noiseScale: 2,
    power: 3,
    amplitude: 1.6,
    frequency: 0.1,
    noiseFactor: 10,
    waveFrequency: 0.2,
    waveTime: 0.6,
};
export function boot() {
    const gui = new GUI();
    gui.add(options, "timeScale", 0, 5).step(0.01);
    gui.add(options, "noiseScale", 0, 2).step(0.01);
    gui.add(options, "power", 0, 3).step(0.01);
    gui.add(options, "amplitude", 0, 10).step(0.01);
    gui.add(options, "frequency", 0, 10).step(0.01);
    gui.add(options, "noiseFactor", 0, 10).step(0.01);
    gui.add(options, "waveFrequency", 0, 10).step(0.01);
    gui.add(options, "waveTime", 0, 10).step(0.01);
}

export function main(coord, context) {
    const t = (context.time / 1000) * options.timeScale;
    const scale = 3 * options.noiseScale;
    const { x, y } = coord;
    const nx = (x / context.cols) * scale;
    const ny = (y / context.rows) * scale;
    const noise = Math.pow(
        p3d.get(nx, ny, t * options.frequency * options.amplitude),
        options.power
    );
    const x1 = x * options.waveFrequency;
    const wave =
        Math.sin(
            x1 +
                options.noiseFactor * mapRange(noise, 0.5, 1, 0, 1, false) +
                Math.sin(t * options.waveTime)
        ) *
            0.5 +
        0.5;
    // return getShade(mapRange(noise, 0.5, 1)) ?? " ";
    return getShade(wave) ?? " ";
}
