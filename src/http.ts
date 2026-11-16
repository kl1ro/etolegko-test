export default async function downloadBody(url: URL): Promise<ArrayBuffer> {
  const response = await sendRequest(url);
  validateResponseStatus(response);
  return readResponseBody(response);
}

async function sendRequest(url: URL): Promise<Response> {
  try {
    return await fetch(url);
  } catch (error) {
    throw new RequestFailedError({ url, cause: error });
  }
}

export class RequestFailedError extends Error {
  public name = RequestFailedError.name;
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

export class UnsuccessfulResponseStatusError extends Error {
  public name = UnsuccessfulResponseStatusError.name;
  public url: Response["url"];
  public status: Response["status"];

  public constructor(options: ErrorOptions & { url: Response["url"]; status: Response["status"] }) {
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
    throw new UnreadableResponseBodyError({ url: response.url, cause: error });
  }
}

export class UnreadableResponseBodyError extends Error {
  public name = UnreadableResponseBodyError.name;
  public url: Response["url"];

  public constructor(options: ErrorOptions & { url: Response["url"] }) {
    super(`Body of response from ${options.url} could not be read`, options);
    this.url = options.url;
  }
}
