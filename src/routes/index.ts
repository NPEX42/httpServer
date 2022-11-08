import { serveFile } from "https://deno.land/std@0.162.0/http/file_server.ts";
import { HttpEndpoint } from "../router.ts";
import { SendFile } from "../util.ts";

export let ENDPOINT: HttpEndpoint = {get: Get};

export function Get(req: Request): Response {
    return SendFile("./static/index.html");
}