import paths from "./config/paths.json" assert { type: "json" };
import host from "./config/host.json" assert { type: "json" };
import secret from "./config/env.json" assert { type: "json" };
import { serveDir, serveFile, serveTls, serve, decode } from "./deps.ts";
import * as path from "https://deno.land/std@0.162.0/path/mod.ts"
import { Router } from "./src/router.ts";

import * as indexRoute from "./src/routes/index.ts";

const HTTP_EC_UNAUTH = 401;
const HTTP_EC_NOT_FOUND = 404;
const HTTP_EC_OK = 200;


// deno-lint-ignore no-unused-vars
const port = host.port;
const hostname = host.hostname || "127.0.0.1";

const router = new Router();

router.SetEndpoint("/test", {get: TestRoute});
router.SetEndpoint("/", indexRoute.ENDPOINT);

const handler = async (req: Request) => {

  return Promise.resolve(router.Route(req));

  const pathname = new URL(req.url).pathname;

  logRequest(req);

  if (req.method == "DELETE") {
      return await delete_file(req);
  }

  if (req.method == "POST") {
    return await create_file(req);
  }

  if (req.method == "PUT") {
    return await update_file(req);
  }


  if (pathname === "/") {
	return serveFile(req, paths.landing);
  }
  if (pathname.startsWith("/")) {
    return serveDir(req, {
      fsRoot: paths.static,
    });
  }

  
  // Do dynamic responses
  return new Response();
};

const envType = host.EnvType ?? "secure";

if ((envType.toLowerCase() == "secure")) {
  console.log("%cStarting HTTPS Server...","color: yellow");
  serveTls(handler, { port: host.port, hostname, certFile: host.certDir+"fullchain.pem", keyFile: host.certDir+"privkey.pem" });
} else if (envType.toLowerCase() == "insecure") {
  console.log("%cStarting HTTP Server...", "color: blue");
  serve(handler, {port: host.insecurePort});
} else if (envType.toLowerCase() == "dev") {
  console.log("%cStarting DEV Server...", "color: blue");
  serve(handler, {port: host.devPort});
}

async function delete_file(req: Request) : Promise<Response> {
    const body = await req.json();
    const pathname = new URL(req.url).pathname;
    const dirs = path.dirname(pathname);
    const ext = path.extname(pathname);
    const filepath = paths.static + "/" + pathname;
    try {
      if (body.secret_key !== secret.secret) {

        return Promise.resolve(FailedResponse(HTTP_EC_UNAUTH, "Invalid Secret"));
      }

      if (dirs != "" && ext == "") {
        Deno.remove(paths.static+(ext == "" ? pathname : dirs), {recursive: true});
        console.debug("Deleted Dir '"+pathname);
      }

      if (ext != "") 
        Deno.removeSync(filepath);
    } catch (err) {

      console.error("Exception: ", err);

      return Promise.resolve(FailedResponse(HTTP_EC_NOT_FOUND, "Failed To Delete File '" + body.filepath + ""));
    }

    return Promise.resolve(Response.json({ok: true}, {status: 200, statusText: "Deleted File '"+body.filepath+"'"}));
}


async function create_file(req: Request) : Promise<Response> {
  const body = await req.json();
  const contents = body.contents;
  const pathname = new URL(req.url).pathname;
  const dirs = path.dirname(pathname);
  const ext = path.extname(pathname);
  const filepath = paths.static + "/" + pathname;


  try {
    if (body.secret_key !== secret.secret) {

      return Promise.reject("Invalid Secret");
    }

    try  { 
      if (dirs != "") {
        Deno.mkdirSync(paths.static+(ext == "" ? pathname : dirs), {recursive: true} );
        console.debug("Created New Dir");
      }
    } catch (e) { console.error("Failed To Create Dirs", e) }

    if (path.extname(pathname) != "") 
      Deno.writeFileSync(filepath, getFileContentsBase64(contents));
  } catch (err) {

    console.error("Exception: ", err);

    return Promise.reject(Response.error());
  }
  return Promise.resolve(Response.json({ok: true}, {status: 200, statusText: "Created File '"+body.filepath+"'"}));
}


async function update_file(req: Request) : Promise<Response> {
  const pathname = new URL(req.url).pathname;
  const body = await req.json();
  const contents = body.contents;
  const path = paths.static + pathname;
  try {
    if (body.secret_key !== secret.secret) {

      return Promise.resolve(Response.json({ok: false}, {status: HTTP_EC_UNAUTH, statusText: "Failed To Update File '"+body.filepath+"'"}));
    }
    Deno.writeFileSync(path, getFileContentsBase64(contents), {create: false});
  } catch (_err) {

    console.error("failed To Update File: ", path);

    return Promise.resolve(FailedResponse(HTTP_EC_NOT_FOUND, "Failed To Update File '" + body.filepath + ""));
  }
  return Promise.resolve(SuccessResponse(HTTP_EC_OK));
}

function FailedResponse(ec: number, text?: string | undefined) : Response {
  return Response.json({ ok: false },{ status: ec, statusText: text ?? "Failed ("+ec+")" });
} 

function SuccessResponse(code: number, text?: string | undefined) : Response {
  return Response.json({ ok: true },{ status: HTTP_EC_OK, statusText: text ?? "Success("+code+")" });
}

function getFileContentsBase64(contents: string) : Uint8Array {
    return decode(contents);
}

function logRequest(req: Request) {

  const url = new URL(req.url);
  console.log("%c["+req.method+"]: "+(req.headers.get("Origin") ?? "<unknown>")+" | "+url+" Path: "+url.pathname, "color: blue");
}



function TestRoute(req: Request) : Response {
    return new Response("Hello, Fucker", {status: 200});
}