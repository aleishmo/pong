// Generates a random number within specified minimum and maximum values.

export function randomRange(min, max) {
  return Math.random() * (max - min) + min
}