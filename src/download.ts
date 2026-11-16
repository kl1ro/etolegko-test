import { getTimeSince, readClock } from "./clock.ts";
import downloadBody from "./http.ts";

export default async function* measureDownloads(
  url: URL,
  deps: MeasureDownloadsDeps,
): AsyncGenerator<DownloadMeasurement> {
  for (let index = 0; index < deps.options.requestCount; index++) yield await measureDownload(url);
}

export interface MeasureDownloadsDeps {
  options: MeasureDownloadsOptions;
}

export interface MeasureDownloadsOptions {
  requestCount: number;
}

export async function measureDownload(url: URL): Promise<DownloadMeasurement> {
  const startTime = readClock();
  const body = await downloadBody(url);
  return { durationInMilliseconds: getTimeSince(startTime), sizeInBytes: body.byteLength };
}

export interface DownloadMeasurement {
  durationInMilliseconds: number;
  sizeInBytes: number;
}
