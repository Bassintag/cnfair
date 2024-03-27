import { program } from "commander";
import type { GlobalOptions } from "../domain/options.ts";

export let globalOptions: GlobalOptions = {};

export const loadGlobalOptions = () => {
  globalOptions = program.opts<GlobalOptions>();
};
