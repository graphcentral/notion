export function createLogger(isVerbose: boolean) {
  if (!isVerbose) return null;
  return (msg: string) => {
    const date = new Date();
    console.log(`[${date.toLocaleString()}] ${msg}`);
  };
}
