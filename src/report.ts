import type { DownloadMeasurement } from "./download.ts";

const MILLISECONDS_IN_SECOND = 1000;
const BITS_IN_BYTE = 8;
const BYTES_IN_MEGABYTE = 1_000_000;
const BITS_IN_MEGABIT = 1_000_000;

export function getDownloadReport(measurements: DownloadMeasurement[]): DownloadReport {
  const totalDurationInMilliseconds = getTotalDuration(measurements);
  const totalSizeInBytes = getTotalSize(measurements);

  const speedInBitsPerSecond = getSpeedFromSizeAndDuration(
    totalSizeInBytes,
    totalDurationInMilliseconds,
  );

  return {
    averageDurationInMilliseconds: totalDurationInMilliseconds / measurements.length,
    totalSizeInBytes,
    speedInBitsPerSecond,
  };
}

export default interface DownloadReport {
  averageDurationInMilliseconds: number;
  totalSizeInBytes: number;
  speedInBitsPerSecond: number;
}

export function printDownloadReport(report: DownloadReport) {
  const averageDuration = formatMilliseconds(report.averageDurationInMilliseconds);
  const totalSize = formatBytesAsMegabytes(report.totalSizeInBytes);
  const speed = formatBitsPerSecondAsMegabits(report.speedInBitsPerSecond);
  console.log(`Среднее время запроса: ${averageDuration}`);
  console.log(`Скачано всего: ${totalSize}`);
  console.log(`Скорость скачивания: ${speed}`);
}

function getTotalDuration(measurements: DownloadMeasurement[]): number {
  const totalDuration = measurements.reduce((acc, cur) => acc + cur.durationInMilliseconds, 0);
  return totalDuration;
}

function getTotalSize(measurements: DownloadMeasurement[]): number {
  const totalSize = measurements.reduce((acc, cur) => acc + cur.sizeInBytes, 0);
  return totalSize;
}

function getSpeedFromSizeAndDuration(sizeInBytes: number, durationInMilliseconds: number): number {
  const sizeInBits = sizeInBytes * BITS_IN_BYTE;
  const durationInSeconds = durationInMilliseconds / MILLISECONDS_IN_SECOND;
  return sizeInBits / durationInSeconds;
}

function formatMilliseconds(milliseconds: number): string {
  return `${milliseconds.toFixed(1)} мс`;
}

function formatBytesAsMegabytes(bytes: number): string {
  return `${(bytes / BYTES_IN_MEGABYTE).toFixed(2)} МБ`;
}

function formatBitsPerSecondAsMegabits(bitsPerSecond: number): string {
  return `${(bitsPerSecond / BITS_IN_MEGABIT).toFixed(2)} Мбит/с`;
}
