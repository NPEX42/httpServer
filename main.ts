import paths from "./paths.json" assert { type: "json" };
import secret from "./env.json" assert { type: "json" };
import { serveDir, serveFile, serveTls } from "./deps.ts";

const port = paths.port;
const hostname = paths.hostname || "127.0.0.1";
const handler = async (req: Request) => {

  const pathname = new URL(req.url).pathname;

  if (req.method == "DELETE") {
      return await delete_file(req);
  }

  if (req.method == "POST") {
    return await post_file(req);
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




serveTls(handler, { port, hostname, certFile: "/etc/letsencrypt/live/npex42.dev/fullchain.pem", keyFile: "/etc/letsencrypt/live/npex42.dev/privkey.pem" });

async function delete_file(req: Request) : Promise<Response> {
    const body = await req.json();
    try {
      if (body.secret_key !== secret.secret) {

        return Promise.reject("Invalid Secret");
      }
      Deno.removeSync(paths.static+"/"+body.filepath);
    } catch (err) {

      console.error("Exception: ", err);

      return Promise.reject(err);
    }

    return Promise.resolve(new Response());
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
