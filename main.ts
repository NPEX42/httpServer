import paths from "./paths.json" assert { type: "json" };
import { serveDir, serveFile, serve } from "./deps.ts";
const port = paths.port;

const handler = (req: Request) => {
  const pathname = new URL(req.url).pathname;
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


serve(handler, { port });

