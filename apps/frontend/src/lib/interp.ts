export type EasingTypes = "linear" | "inQuad" | "outQuad" | "inOutQuad" | "inQuart" | "outQuart" | "inOutQuart";

const INTERP_FUNCTIONS: { [key in EasingTypes]: (x: number) => number } = {
  linear: (x) => x,

  inQuad: (x) => x * x,
  outQuad: (x) => Math.sin((x * Math.PI) / 2),
  inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),

  inQuart: (x) => x * x * x * x,
  outQuart: (x) => 1 - Math.pow(1 - x, 4),
  inOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
};

export function getInterpFunction(easingType: EasingTypes): (x: number) => number {
  const func = INTERP_FUNCTIONS[easingType];
  if (!func) {
    throw new Error(`Unknown easing type: ${easingType}`);
  }

  return func;
}

export function interp(easingType: EasingTypes, progress: number, ...args: number[]): number[] {
  const func = INTERP_FUNCTIONS[easingType];
  if (!func) {
    throw new Error(`Unknown easing type: ${easingType}`);
  }

  if (args.length % 2 !== 0) {
    throw new Error("Arguments must be pairs of numbers");
  }

  let returnedValues: number[] = [];

  for (let i = 0; i < args.length; i += 2) {
    const start = args[i],
      end = args[i + 1];

    returnedValues.push(start + (end - start) * func(progress));
  }

  return returnedValues;
}
