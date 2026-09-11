import { createOtp } from "../../components/otp/otp.js";
import { component } from "../../core/component/index.js";

export function page() {
    const $otp = component('.otp-input', createOtp({
        filter: (value) => value.replace(/\D/g, ''),
    }));
}