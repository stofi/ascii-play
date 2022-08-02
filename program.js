/**
@author kurishutofu
@title  Raymarch

?video night
*/

const getShade = (f) => {
  if (f < 0) return '#'
  if (f > 1) return '.'
  const map = '$@B%8&WM#ZO0QLCJUYXzcvunxrjft-_+~'
  const index = Math.floor((map.length - 1) * f)
  return map[index]
}

const vec3 = (x, y, z) => [x, y, z]
const vec3Length = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
const vec3Scale = (v1, v2) => [v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]]
const vec3ScaleScalar = (v, s) => [v[0] * s, v[1] * s, v[2] * s]
const vec3Add = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]]
const vec3AddScalar = (v, s) => [v[0] + s, v[1] + s, v[2] + s]
const vec3Sub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]
const vec3SubScalar = (v, s) => [v[0] - s, v[1] - s, v[2] - s]
const vec3Dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
const vec3Cross = (v1, v2) => [
  v1[1] * v2[2] - v1[2] * v2[1],
  v1[2] * v2[0] - v1[0] * v2[2],
  v1[0] * v2[1] - v1[1] * v2[0],
]

const vec3Normalize = (v) => vec3ScaleScalar(v, 1 / vec3Length(v))
const vec3Clone = (v) => [v[0], v[1], v[2]]

const vec2 = (x, y) => [x, y]
const vec2Length = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1])
const vec2Scale = (v1, v2) => [v1[0] * v2[0], v1[1] * v2[1]]
const vec2ScaleScalar = (v, s) => [v[0] * s, v[1] * s]
const vec2Add = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]]
const vec2AddScalar = (v, s) => [v[0] + s, v[1] + s]
const vec2Sub = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1]]
const vec2SubScalar = (v, s) => [v[0] - s, v[1] - s]
const vec2Normalize = (v) => vec2ScaleScalar(v, 1 / vec2Length(v))
const vec2Clone = (v) => [v[0], v[1]]

const sdSphere = (p, s) => vec3Length(p) - s
const sdf = (p, t = 0) => {
  const pos = vec3Clone(p)
  pos[1] += Math.sin(t * 2) / 6
  return sdSphere(pos, 0.3)
}

const getNormal = (p, t = 0) => {
  const eps = vec2(0.0001, 0)
  const xyy = vec3(eps[0], eps[1], eps[1])
  const yxy = vec3(eps[1], eps[0], eps[1])
  const yyx = vec3(eps[1], eps[1], eps[0])

  return vec3ScaleScalar(
    vec3Normalize(
      vec3(
        sdf(vec3Add(p, xyy), t) - sdf(vec3Sub(p, xyy), t),

        sdf(vec3Add(p, yxy), t) - sdf(vec3Sub(p, yxy), t),

        sdf(vec3Add(p, yyx), t) - sdf(vec3Sub(p, yyx), t)
      )
    ),
    -1
  )
}

export const settings = {
  backgroundColor: '#323132',
  color: '#fffefc',
  once: false,
}

export function main(coord, context) {
  const t0 = context.time * 0.001

  // uv is from 0 to 1
  const uv = vec2((coord.x + 1) / context.cols, (coord.y + 1) / context.rows)

  const aspect = vec2Normalize(vec2(context.width, context.height))

  // new uv is uv from -.5 to .5
  const newUv = vec2AddScalar(vec2Scale(vec2SubScalar(uv, 0.5), aspect), 0.5)
  const centeredUv = vec2AddScalar(newUv, -0.5)
  centeredUv[1] *= -1
  const camPos = vec3(0, 0, 3)
  const ray = vec3Normalize(vec3(centeredUv[0], centeredUv[1], -1))

  let rayPos = vec3Clone(camPos)
  let t = 0
  const tMax = 6
  let min = 20
  let max = 1
  for (let i = 0; i < 80; i++) {
    const pos = vec3Add(camPos, vec3ScaleScalar(ray, t))
    const h = sdf(pos, t0)
    if (h < 0.00001 || t > tMax) break
    t += h
    max = h
    min = h < min ? h : min
  }
  let char = ''
  if (t < tMax) {
    const pos = vec3Add(camPos, vec3ScaleScalar(ray, t))
    const normal = getNormal(pos)
    const lightPos = vec3(Math.sin(t0) * 2, 2, Math.cos(t0) * 2)
    const direction = vec3Sub(pos, lightPos)
    const diff = vec3Dot(direction, normal)
    char = getShade(-diff)
  }
  return char
}

import { drawInfo, drawBox } from '/src/modules/drawbox.js'

export function post(context, cursor, buffer) {
  let u = (cursor.x + 1) / context.cols
  let v = (cursor.y + 1) / context.rows

  let style = {
    x: 1,
    y: 1,
    width: 32,
    height: 5,
    backgroundColor: 'black',
    color: 'white',
  }
  let text = `Info
c: ${context.cols} x: ${cursor.x.toFixed(2)} u: ${u.toFixed(2)}
r: ${context.rows} y: ${cursor.y.toFixed(2)} v: ${v.toFixed(2)}
`

  drawBox(text, style, buffer, context.cols, context.rows)
}
