import { InvalidArgumentError, Option, program } from "commander";
import { token } from "./commands/token.ts";
import { redeem } from "./commands/redeem.ts";
import { loadGlobalOptions } from "./utils/options.ts";

const parseIntArg = (value: unknown): number => {
  const parsedValue = parseInt(value as string, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError(`Invalid number: '${value}'`);
  }
  return parsedValue;
};

export const start = () => {
  program.addOption(new Option("--log-http", "Log HTTP requests"));

  program
    .command("redeem")
    .arguments("<productIds...>")
    .addOption(
      new Option(
        "-d, --delay <amount>",
        "Delay between each attempts in seconds",
      )
        .argParser(parseIntArg)
        .default(5),
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
