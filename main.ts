import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import { serveDir, serveFile } from "https://deno.land/std@0.156.0/http/file_server.ts";
import paths from "./paths.json" assert { type: "json" };
serve((req) => {
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
});

