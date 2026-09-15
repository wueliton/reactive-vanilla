import { createCodeEditor, createOtp } from "../../components/index.js";
import { component } from "../../dist/reactive.js";
import { hightlight } from "../../utils/highlight.js";

export function page(root) {
  component("[code-editor]", createCodeEditor());
}
