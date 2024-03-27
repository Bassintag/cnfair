import type { AppConfig } from "../domain/config.ts";
import fs from "fs/promises";

const configPath = "cnfair.config.json";

const defaultConfig: AppConfig = {
  pandabuyToken: "",
};

const createConfigIfMissing = async () => {
  const exists = await fs.exists(configPath);
  if (!exists) {
    await saveConfig(defaultConfig);
    return true;
  }
  return false;
};

export const saveConfig = async (config: AppConfig) => {
  await fs.writeFile(configPath, JSON.stringify(config, undefined, 2));
};

export const loadConfig = async () => {
  if (await createConfigIfMissing()) {
    return defaultConfig;
  }
  const data = await fs.readFile(configPath, "utf-8");
  return JSON.parse(data) as AppConfig;
};
