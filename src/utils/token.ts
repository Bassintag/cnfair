import chalk from "chalk";
import type { AppConfig } from "../domain/config.ts";
import { program } from "commander";
import { jwtDecode } from "jwt-decode";

const browserCmd =
  'token=localStorage.getItem("PANDABUY_TOKEN");console.log(token||"ERROR: Pandabuy token not found")';

const ONE_HOUR = 3_600;

export const validateToken = (config: AppConfig) => {
  if (config.pandabuyToken == null) {
    console.log(chalk.red(chalk.bold("ERROR: Missing pandabuy token")));
  } else {
    const payload = jwtDecode(config.pandabuyToken);
    const diff = (payload.exp ?? 0) - Date.now() / 1_000;
    if (diff < ONE_HOUR) {
      console.log(chalk.red(chalk.bold("ERROR: Token has expired")));
    } else {
      return;
    }
  }
  console.log(
    "\n1. Type the following command in the console of a browser tab logged into pandabuy to get your token:",
  );
  console.log(chalk.italic(`\t${browserCmd}`));
  console.log("\n2. Enter the following command and enter your token");
  console.log(chalk.italic(`\tbun ${program.name()} token`));
  process.exit(1);
};
