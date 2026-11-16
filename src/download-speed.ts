import getUrlFromCommandLine from "./command-line.ts";
import measureDownloads, { type DownloadMeasurement } from "./download.ts";
import {
  printDownloadHeader,
  startProgressBar,
  stopProgressBar,
  updateProgressBar,
} from "./progress.ts";
import { getDownloadReport, printDownloadReport } from "./report.ts";

const REQUEST_COUNT = 10;

async function main() {
  const deps = { options: { requestCount: REQUEST_COUNT } };

  try {
    const url = getUrlFromCommandLine();
    printDownloadHeader(url);
    const measurements = await measureDownloadsWithProgress(url, deps);
    const report = getDownloadReport(measurements);
    printDownloadReport(report);
  } catch (error) {
    reportSpeedMeasurementError(error);
  }
}

async function measureDownloadsWithProgress(
  url: URL,
  deps: MeasureDownloadsWithProgressDeps,
): Promise<DownloadMeasurement[]> {
  const measurements: DownloadMeasurement[] = [];
  const progressBar = startProgressBar(deps);

  try {
    for await (const measurement of measureDownloads(url, deps)) {
      measurements.push(measurement);
      updateProgressBar(progressBar, getDownloadReport(measurements));
    }
  } finally {
    stopProgressBar(progressBar);
  }

  return measurements;
}

interface MeasureDownloadsWithProgressDeps {
  options: MeasureDownloadsWithProgressOptions;
}

interface MeasureDownloadsWithProgressOptions {
  requestCount: number;
}

function reportSpeedMeasurementError(error: unknown) {
  console.error("Не удалось измерить скорость скачивания");
  console.error(error);
  process.exitCode = 1;
}

void main();
