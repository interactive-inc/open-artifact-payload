import { execFileSync } from "node:child_process"

export default function setup() {
  execFileSync("vp", ["run", "test:int:migrate"], { stdio: "inherit" })
}
