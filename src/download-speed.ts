import getUrlFromCommandLine from "./command-line.ts";
import measureDownloads, { type DownloadMeasurement } from "./download.ts";
import { getDownloadReport, printDownloadReport, printProgressReport } from "./report.ts";

const REQUEST_COUNT = 10;

async function main() {
  const deps = { options: { requestCount: REQUEST_COUNT } };

  try {
    const url = getUrlFromCommandLine();
    const measurements = await measureDownloadsWithProgress(url, deps);
    const report = getDownloadReport(measurements);
    printDownloadReport(report);
  } catch (error) {
    console.error("Не удалось измерить скорость скачивания");
    console.error(error);
    process.exitCode = 1;
  }
}

async function measureDownloadsWithProgress(
  url: URL,
  deps: MeasureDownloadsWithProgressDeps,
): Promise<DownloadMeasurement[]> {
  const measurements: DownloadMeasurement[] = [];

  for await (const measurement of measureDownloads(url, deps)) {
    measurements.push(measurement);
    printProgressReport(getDownloadReport(measurements), deps);
  }

  return measurements;
}

interface MeasureDownloadsWithProgressDeps {
  options: MeasureDownloadsWithProgressOptions;
}

interface MeasureDownloadsWithProgressOptions {
  requestCount: number;
}

void main();
