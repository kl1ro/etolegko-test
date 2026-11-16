const REQUEST_COUNT = 10;
const MILLISECONDS_IN_SECOND = 1000;
const BITS_IN_BYTE = 8;
const BYTES_IN_MEGABYTE = 1_000_000;
const BITS_IN_MEGABIT = 1_000_000;

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

function getUrlFromCommandLine(): URL {
  const address = findAddressArgument();
  if (!address) throw new NoAddressArgumentError();
  return convertAddressToUrl(address);
}

class NoAddressArgumentError extends Error {
  public name = NoAddressArgumentError.name;

  public constructor(options?: ErrorOptions) {
    super("No address argument is given. Usage: npx tsx download-speed.ts <url>", options);
  }
}

async function measureDownloads(
  url: URL,
  deps: MeasureDownloadsDeps,
): Promise<DownloadMeasurement[]> {
  const measurements: DownloadMeasurement[] = [];

  for (let index = 0; index < deps.options.requestCount; index++)
    measurements.push(await measureDownload(url));

  return measurements;
}

interface MeasureDownloadsDeps {
  options: MeasureDownloadsOptions;
}

interface MeasureDownloadsOptions {
  requestCount: number;
}

function getDownloadReport(measurements: DownloadMeasurement[]): DownloadReport {
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

interface DownloadReport {
  averageDurationInMilliseconds: number;
  totalSizeInBytes: number;
  speedInBitsPerSecond: number;
}

function printDownloadReport(report: DownloadReport) {
  const averageDuration = formatMilliseconds(report.averageDurationInMilliseconds);
  const totalSize = formatBytesAsMegabytes(report.totalSizeInBytes);
  const speed = formatBitsPerSecondAsMegabits(report.speedInBitsPerSecond);
  console.log(`Среднее время запроса: ${averageDuration}`);
  console.log(`Скачано всего: ${totalSize}`);
  console.log(`Скорость скачивания: ${speed}`);
}

function findAddressArgument(): string | undefined {
  const [address] = process.argv.slice(2);
  return address;
}

function convertAddressToUrl(address: string): URL {
  try {
    return new URL(address);
  } catch (error) {
    throw new InvalidAddressError({ address, cause: error });
  }
}

class InvalidAddressError extends Error {
  public name = InvalidAddressError.name;
  public address: string;

  public constructor(options: ErrorOptions & { address: string }) {
    super(`Address ${options.address} is not a valid URL`, options);
    this.address = options.address;
  }
}

async function measureDownload(url: URL): Promise<DownloadMeasurement> {
  const startTime = readClock();
  const body = await downloadBody(url);
  return { durationInMilliseconds: getTimeSince(startTime), sizeInBytes: body.byteLength };
}

interface DownloadMeasurement {
  durationInMilliseconds: number;
  sizeInBytes: number;
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

function readClock(): number {
  return performance.now();
}

async function downloadBody(url: URL): Promise<ArrayBuffer> {
  const response = await sendRequest(url);
  validateResponseStatus(response);
  return readResponseBody(response);
}

function getTimeSince(startTime: number): number {
  return readClock() - startTime;
}

async function sendRequest(url: URL): Promise<Response> {
  try {
    return await fetch(url);
  } catch (error) {
    throw new SendRequestError({ url, cause: error });
  }
}

class SendRequestError extends Error {
  public name = SendRequestError.name;
  public url: URL;

  public constructor(options: ErrorOptions & { url: URL }) {
    super(`Request to ${options.url.href} failed`, options);
    this.url = options.url;
  }
}

function validateResponseStatus(response: Response) {
  if (!response.ok)
    throw new UnsuccessfulResponseStatusError({ url: response.url, status: response.status });
}

class UnsuccessfulResponseStatusError extends Error {
  public name = UnsuccessfulResponseStatusError.name;
  public url: Response["url"];
  public status: Response["status"];

  public constructor(
    options: ErrorOptions & { url: Response["url"]; status: Response["status"] },
  ) {
    super(
      `Response from ${options.url} has unsuccessful status ${String(options.status)}`,
      options,
    );

    this.url = options.url;
    this.status = options.status;
  }
}

async function readResponseBody(response: Response): Promise<ArrayBuffer> {
  try {
    return await response.arrayBuffer();
  } catch (error) {
    throw new ReadResponseBodyError({ url: response.url, cause: error });
  }
}

class ReadResponseBodyError extends Error {
  public name = ReadResponseBodyError.name;
  public url: Response["url"];

  public constructor(options: ErrorOptions & { url: Response["url"] }) {
    super(`Body of response from ${options.url} could not be read`, options);
    this.url = options.url;
  }
}

void main();
