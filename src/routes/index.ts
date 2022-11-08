import { serveFile } from "https://deno.land/std@0.162.0/http/file_server.ts";
import { HttpEndpoint } from "../router.ts";
import { CreateFile, Pathname, SendFile, ServeDirectory } from "../util.ts";
import Paths from "../../config/paths.json" assert {type: "json"}

export let ENDPOINT: HttpEndpoint = {get: Get};

export function Get(req: Request): Response {
    if (Pathname(req) == "/TestDead") { 
        return CreateFile(req);
    }
    return ServeDirectory(req, Paths.static);
}

