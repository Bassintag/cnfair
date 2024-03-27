import { loadConfig, saveConfig } from "../utils/config.ts";
import { input } from "@inquirer/prompts";

export const token = async (token?: string) => {
  const config = await loadConfig();
  if (token == null) {
    config.pandabuyToken = await input({
      message: "Please enter your pandabuy access token:",
    });
  } else {
    config.pandabuyToken = token;
  }
  await saveConfig(config);
};
