import { localStorageMock } from "./src/__mocks__/localStorage.js";
import $ from "jquery";
global.$ = global.jQuery = $;

export function setSessionStorage(user) {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: user,
    })
  );
}
