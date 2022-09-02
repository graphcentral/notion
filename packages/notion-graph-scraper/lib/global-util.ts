import { to } from "await-to-js";

/**
 * await-to-js wrapper to enable serializing the error to
 * a normal javascript object
 */
export async function toEnhanced<Result, Err = Error>(
  p: Promise<Result>
): Promise<[Err | null, Result | undefined]> {
  const [err, result] = await to<Result, Err>(p);

  return [err, result];
}

export function debugObject<T>(obj: T) {
  console.log(JSON.stringify(obj, null, 2));
}
