import * as path from "path";
import {
  dependencies,
  peerDependencies,
  devDependencies,
} from "../package.json";

const external = [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies),
  ...Object.keys(devDependencies),
];

void Bun.build({
  entrypoints: [path.join(__dirname, "..", "src", "cnfair.ts")],
  outdir: path.join(__dirname, "..", "dist"),
  minify: true,
  external,
  target: "node",
});
