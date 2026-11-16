export default function getUrlFromCommandLine(): URL {
  const address = findAddressArgument();
  if (!address) throw new NoAddressArgumentError();
  return convertAddressToUrl(address);
}

export class NoAddressArgumentError extends Error {
  public name = NoAddressArgumentError.name;

  public constructor(options?: ErrorOptions) {
    super("No address argument is given. Usage: npx tsx download-speed.ts <url>", options);
  }
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

export class InvalidAddressError extends Error {
  public name = InvalidAddressError.name;
  public address: string;

  public constructor(options: ErrorOptions & { address: string }) {
    super(`Address ${options.address} is not a valid URL`, options);
    this.address = options.address;
  }
}
