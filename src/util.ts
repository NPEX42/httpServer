import { bold } from "https://deno.land/std@0.162.0/fmt/colors.ts";
import * as Path from "https://deno.land/std@0.162.0/path/mod.ts";
import Paths from "../config/paths.json" assert {type: "json"}
export function SendFile(path: string | URL, status: number | null): Response {
    try {
        return new Response(Deno.readFileSync(path), {status: status || 200});
    } catch (e) {
        return FileNotFound(path);
    }
}

export function CreateFile(req: Request): Response {
    if (req.bodyUsed) {
        const url = new URL(req.url);
        const dir = Path.dirname(url.pathname);
        const file = Path.basename(url.pathname);
        return new Response("Created File "+url.pathname);
    } else {
        return BadRequest();
    }
}



export function ServeDirectory(req: Request, baseDir: string): Response {

    const url = new URL(req.url);
    const dir = Path.dirname(url.pathname);
    const file = Path.basename(url.pathname) || "index.html";
    console.debug("Dir: ", dir);
    console.debug("File: ", file);



    if (Path.isAbsolute(dir)) {
        return SendFile(baseDir+dir+file, 200)
    } else {
        return BadRequest();
    }
}

export function FileNotFound(url: URL | string): Response {
    return new Response(JSON.stringify({success: false, requestedUrl: Path.dirname(url.toString())}));
}


export function ServerIsATeapot(): Response {
    return SendFile("./static/error/418.html", 418);
}

export function ServiceUnavailable(): Response {
    return SendFile("./static/error/418.html", 418);
}

export function BadRequest(): Response {
    return SendFile("./static/error/400.html", 400);
}

export function MethodNotSupported(): Response {
    return SendFile("./static/error/405.html", 405);
}

export function HtmlHeaders(): Headers {
    return ContentTypeHeader("text/html");
}

export function ContentTypeHeader(type: string): Headers {
    const header = new Headers();
    header.append("content-type", type);
    return header;
}

export function CorsHeader(origin: string): Headers {
    const header = new Headers();
    header.append("Access-Control-Allow-Origin", origin);
    return header;
}

export function ConcatHeaders(src: Headers, dest: Headers): Headers {
    const entries = src.entries();
    for (const [name, value] of entries) {
        dest.append(name, value);
    }
    return dest;
}

export function Pathname(req: Request): string {
    return new URL(req.url).pathname;
}