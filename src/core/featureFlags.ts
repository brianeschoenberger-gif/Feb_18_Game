const params = new URLSearchParams(window.location.search);
export const ENABLE_THREE_MIRROR = params.get("three") === "1";
