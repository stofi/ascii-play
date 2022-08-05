# Experiments in @ertdfgcvb ASCII play 

## Introduction

This repository contains the play.core codebase in the `src` directory, so that the experiments can be copy pasted to the playground or run localy with `vite`.

### Running locally

Install dependencies:

```bash
yarn
```

Run the dev server:

```bash
yarn dev
```

Alternatively, you can add a `--mode` flag to change the experiment. Valid modes are: `raymarch`, `waves`, `wfc`.

```bash
$ vite dev --mode wfc
```



### Links
- [ASCII Play](https://play.ertdfgcvb.xyz)
- [Documentation](https://play.ertdfgcvb.xyz/abc.html)

## Experiments

### [01. Raymarching](experiments/01-raymarch.js)
Using [raymarching](https://en.wikipedia.org/wiki/Raymarching) to render 3D shapes from signed distance functions.

[Playground](https://play.ertdfgcvb.xyz/#/1659704731657)

### [02. Perlin Noise Waves](experiments/02-waves.js)
Simple wave pattern based on Perlin noise. (Implementation of noise is not mine)

[Playground](https://play.ertdfgcvb.xyz/#/1659704635202)

### [03. Wave Function Collapse](experiments/03-wfc.js)
Wave function collapse experiment.

[Playground](https://play.ertdfgcvb.xyz/#/1659704759466)


