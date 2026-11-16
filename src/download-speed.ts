import getUrlFromCommandLine from "./command-line.ts";
import measureDownloads from "./download.ts";
import { getDownloadReport, printDownloadReport } from "./report.ts";

const REQUEST_COUNT = 10;

async function main() {
  const deps = { options: { requestCount: REQUEST_COUNT } };

  try {
    const url = getUrlFromCommandLine();
    const measurements = await measureDownloads(url, deps);
    const report = getDownloadReport(measurements);
    printDownloadReport(report);
  } catch (error) {
    console.error("Не удалось измерить скорость скачивания");
    console.error(error);
    process.exitCode = 1;
  }
}

void main();
