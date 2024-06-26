import { InvalidArgumentError, Option, program } from "commander";
import { token } from "./commands/token.ts";
import { redeem } from "./commands/redeem.ts";
import { loadGlobalOptions } from "./utils/options.ts";
import { version } from "../package.json";

const parseIntArg = (value: unknown): number => {
  const parsedValue = parseInt(value as string, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError(`Invalid number: '${value}'`);
  }
  return parsedValue;
};

export const start = () => {
  program
    .version(version)
    .addOption(new Option("--log-http", "Log HTTP requests"));

  program
    .command("redeem")
    .arguments("<productIds...>")
    .addOption(new Option("-r, --restock", "Enable restock mode"))
    .addOption(
      new Option(
        "-d, --delay <amount>",
        "Delay between each attempts in seconds",
      )
        .argParser(parseIntArg)
        .default(5),
    )
    .addOption(
      new Option(
        "--restock-delay <amount>",
        "Delay between each attempts in seconds when in restock mode",
      )
        .argParser(parseIntArg)
        .default(10),
    )
    .addOption(
      new Option("-w, --way <method>", "Payment method")
        .choices(["points", "balance"])
        .default("points"),
    )
    .action(redeem);

  program.command("token").arguments("[token]").action(token);

  program.parse();

  loadGlobalOptions();
};
