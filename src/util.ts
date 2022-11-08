export function SendFile(path: string | URL): Response {
    try {
        return new Response(Deno.readFileSync(path), {status: 200});
    } catch (e) {
        return new Response("404 - File Not Found", {status: 404});
    }
}