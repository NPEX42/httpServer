import paths from "./config/paths.json" assert { type: "json" };
import host from "./config/host.json" assert { type: "json" };
import secret from "./config/env.json" assert { type: "json" };
import { serveDir, serveFile, serveTls, printf, serve } from "./deps.ts";

const HTTP_EC_UNAUTH = 401;
const HTTP_EC_NOT_FOUND = 404;
const HTTP_EC_OK = 200;


const port = host.port;
const hostname = host.hostname || "127.0.0.1";
const handler = async (req: Request) => {

  const pathname = new URL(req.url).pathname;

  printf("[REQ] %s - %s\n", req.method, pathname);

  if (req.method == "DELETE") {
      return await delete_file(req);
  }

  if (req.method == "POST") {
    return await post_file(req);
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


if (host.useSecure ?? true) {
  console.log("%cStarting HTTPS Server...\n CertDirectory: ","color: blue" , host.certDir);
  serveTls(handler, { port: 443, hostname, certFile: host.certDir+"fullchain.pem", keyFile: host.certDir+"privkey.pem" });
} else {
  console.log("%cStarting HTTP Server...", "color: blue");
  serve(handler, {port: 80});
}
async function delete_file(req: Request) : Promise<Response> {
    const body = await req.json();
    try {
      if (body.secret_key !== secret.secret) {

        return Promise.resolve(FailedResponse(HTTP_EC_UNAUTH, "Invalid Secret"));
      }
      Deno.removeSync(paths.static+"/"+body.filepath);
    } catch (err) {

      console.error("Exception: ", err);

      return Promise.resolve(FailedResponse(HTTP_EC_NOT_FOUND, "Failed To Delete File '" + body.filepath + ""));
    }

    return Promise.resolve(Response.json({ok: true}, {status: 200, statusText: "Deleted File '"+body.filepath+"'"}));
}


async function post_file(req: Request) : Promise<Response> {
  const body = await req.json();
  const contents = body.contents;
  try {
    if (body.secret_key !== secret.secret) {

      return Promise.reject("Invalid Secret");
    }

    

    const encoder = new TextEncoder();
    Deno.writeFileSync(paths.static+"/"+body.filepath, encoder.encode(contents));
  } catch (err) {

    console.error("Exception: ", err);

    return Promise.reject(Response.error());
  }
  return Promise.resolve(Response.json({ok: true}, {status: 200, statusText: "Created File '"+body.filepath+"'"}));
}


async function update_file(req: Request) : Promise<Response> {
  const body = await req.json();
  const contents = body.contents;
  const path = paths.static+"/"+body.filepath;
  try {
    if (body.secret_key !== secret.secret) {

      return Promise.resolve(Response.json({ok: false}, {status: HTTP_EC_UNAUTH, statusText: "Failed To Update File '"+body.filepath+"'"}));
    }
    
    console.debug("[PUT] IP: ", req.headers.get("Origin") ?? "<unknown>", " - ", path);
    const encoder = new TextEncoder();
    Deno.writeFileSync(path, encoder.encode(contents), {create: false});
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