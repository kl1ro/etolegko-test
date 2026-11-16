import type { DownloadMeasurement } from "./download.ts";

const MILLISECONDS_IN_SECOND = 1000;
const BITS_IN_BYTE = 8;
const BYTES_IN_MEGABYTE = 1_000_000;
const BITS_IN_MEGABIT = 1_000_000;
const SUMMARY_INDENT = "  ";
const SUMMARY_LABEL_WIDTH = 24;

export function getDownloadReport(measurements: DownloadMeasurement[]): DownloadReport {
  const totalDurationInMilliseconds = getTotalDuration(measurements);
  const totalSizeInBytes = getTotalSize(measurements);

  const speedInBitsPerSecond = getSpeedFromSizeAndDuration(
    totalSizeInBytes,
    totalDurationInMilliseconds,
  );

  return {
    requestCount: measurements.length,
    averageDurationInMilliseconds: totalDurationInMilliseconds / measurements.length,
    totalSizeInBytes,
    speedInBitsPerSecond,
  };
}

export default interface DownloadReport {
  requestCount: number;
  averageDurationInMilliseconds: number;
  totalSizeInBytes: number;
  speedInBitsPerSecond: number;
}

export function printDownloadReport(report: DownloadReport) {
  const formatted = formatDownloadReport(report);
  console.log("\nИтог");
  console.log(formatSummaryRow("Среднее время запроса", formatted.averageDuration));
  console.log(formatSummaryRow("Скачано всего", formatted.totalSize));
  console.log(formatSummaryRow("Скорость скачивания", formatted.speed));
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

export function formatDownloadReport(report: DownloadReport): FormattedDownloadReport {
  return {
    averageDuration: formatMilliseconds(report.averageDurationInMilliseconds),
    totalSize: formatBytesAsMegabytes(report.totalSizeInBytes),
    speed: formatBitsPerSecondAsMegabits(report.speedInBitsPerSecond),
  };
}

export interface FormattedDownloadReport {
  averageDuration: string;
  totalSize: string;
  speed: string;
}

function formatSummaryRow(label: string, value: string): string {
  return `${SUMMARY_INDENT}${label.padEnd(SUMMARY_LABEL_WIDTH)}${value}`;
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
