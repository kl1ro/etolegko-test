import { SingleBar, type Options } from "cli-progress";

import type DownloadReport from "./report.ts";
import { formatDownloadReport, type FormattedDownloadReport } from "./report.ts";

const EMPTY_STATISTIC = "—";

const PROGRESS_BAR_OPTIONS: Options = {
  format: "[{bar}] {value}/{total}  среднее {averageDuration} · {totalSize} · {speed}",
  barCompleteChar: "█",
  barIncompleteChar: "░",
  barsize: 20,
  hideCursor: true,
};

const EMPTY_PROGRESS: FormattedDownloadReport = {
  averageDuration: EMPTY_STATISTIC,
  totalSize: EMPTY_STATISTIC,
  speed: EMPTY_STATISTIC,
};

export function startProgressBar(deps: StartProgressBarDeps): ProgressBar {
  const progressBar = new SingleBar(PROGRESS_BAR_OPTIONS);
  progressBar.start(deps.options.requestCount, 0, EMPTY_PROGRESS);
  return progressBar;
}

export type ProgressBar = SingleBar;

export interface StartProgressBarDeps {
  options: StartProgressBarOptions;
}

export interface StartProgressBarOptions {
  requestCount: number;
}

export function updateProgressBar(progressBar: ProgressBar, report: DownloadReport) {
  progressBar.update(report.requestCount, formatDownloadReport(report));
}

export function stopProgressBar(progressBar: ProgressBar) {
  progressBar.stop();
}
