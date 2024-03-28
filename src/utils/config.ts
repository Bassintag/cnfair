import type { AppConfig } from "../domain/config.ts";
import fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const configPath = path.resolve(os.homedir(), ".cnfair", "cnfair.config.json");

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
  const dirName = path.dirname(configPath);
  await fs.mkdir(dirName, {
    recursive: true,
  });
  await fs.writeFile(configPath, JSON.stringify(config, undefined, 2));
};

export const loadConfig = async () => {
  if (await createConfigIfMissing()) {
    return defaultConfig;
  }
  const data = await fs.readFile(configPath, "utf-8");
  return JSON.parse(data) as AppConfig;
};
