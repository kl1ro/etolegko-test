export function readClock(): number {
  return performance.now();
}

export function getTimeSince(startTime: number): number {
  return readClock() - startTime;
}
