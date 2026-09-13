import { createOtp } from "../../components/index.js";
import { component } from "../../dist/reactive.js";

export function page() {
  component(
    "[otp-input]",
    createOtp({
      filter: (value) => value.replace(/\D/g, ""),
    }),
  );
}
