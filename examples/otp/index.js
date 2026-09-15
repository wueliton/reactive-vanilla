import { createCodeEditor } from "../../components/index.js";
import { component } from "../../dist/reactive.js";

export function page(root) {
  component("[code-editor]", createCodeEditor());
}
