import got from "got";
import { DEFAULT_HEADERS } from "#utils/http.js";
import {
  ERR_EMPTY_CODE,
  ERR_INVALID_LANGUAGE,
  VALID_LANGUAGES
} from "./constants.js";

/**
 * generateImage is a function to generate code snippet image using Graphene.
 * @param {string} code The code you want to highlight
 * @param {string | null} lang The language for syntax highlighting. Use null to automatically detect the language.
 * @returns
 */
export async function generateImage(code, lang) {
  if (code === undefined || code === null || code === "") {
    return Promise.reject(ERR_EMPTY_CODE);
  }

  if (lang !== undefined && lang !== "" && !VALID_LANGUAGES[lang]) {
    return Promise.reject(ERR_INVALID_LANGUAGE);
  }

  const linenr = code.split("\n").length;
  const { body } = await got.post("https://graphene.teknologiumum.com/api", {
    headers: DEFAULT_HEADERS,
    json: {
      code: code.replace(/^\s+|\s+$/g, ""), // trim extranous whitespace at the end of the code
      lang,
      theme: "github-dark-dimmed",
      upscale: 3,
      lineNumber: linenr > 10,
      border: {
        thickness: 20,
        colour: "#A0ADB6",
        radius: 4
      }
    },
    responseType: "buffer",
    timeout: {
      request: 30_000
    },
    retry: {
      limit: 3,
      methods: ["POST"],
      statusCodes: [429, 500, 502, 503, 504]
    }
  });

  return body;
}
