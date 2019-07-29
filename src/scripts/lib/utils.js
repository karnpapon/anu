const getRandomInt = function(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const isChar = (c) => {
  return c.length === 1 && c.match(/[A-Z]/i);
}

const clamp = (v, min, max) => { return v < min ? min : v > max ? max : v } 

exports.getRandomInt = getRandomInt
exports.scale = scale
exports.isChar = isChar
exports.clamp = clamp


const $ = id => document.getElementById(id);
const qs = id => document.querySelector(id);
const el = tag => document.createElement(tag);

exports.$ = $;
exports.qs = qs;
exports.el = el;