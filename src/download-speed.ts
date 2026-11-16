import getUrlFromCommandLine from "./command-line.ts";
import printDownloadHeader from "./header.ts";
import measureDownloads, { type DownloadMeasurement } from "./download.ts";
import {
  startProgressBar,
  stopProgressBar,
  updateProgressBarWithReport,
  type ProgressBar,
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
  const progressBar = startProgressBar(deps);
  const innerDeps = { ...deps, progressBar };

  try {
    return await collectDownloadMeasurements(url, innerDeps);
  } finally {
    stopProgressBar(progressBar);
  }
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

async function collectDownloadMeasurements(
  url: URL,
  deps: CollectDownloadMeasurementsDeps,
): Promise<DownloadMeasurement[]> {
  const measurements: DownloadMeasurement[] = [];

  for await (const measurement of measureDownloads(url, deps)) {
    measurements.push(measurement);
    showMeasurementsProgress(measurements, deps);
  }

  return measurements;
}

interface CollectDownloadMeasurementsDeps {
  options: CollectDownloadMeasurementsOptions;
  progressBar: ProgressBar;
}

interface CollectDownloadMeasurementsOptions {
  requestCount: number;
}

function showMeasurementsProgress(
  measurements: DownloadMeasurement[],
  deps: ShowMeasurementsProgressDeps,
) {
  updateProgressBarWithReport(deps.progressBar, getDownloadReport(measurements));
}

interface ShowMeasurementsProgressDeps {
  progressBar: ProgressBar;
}

void main();
