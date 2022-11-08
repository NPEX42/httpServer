export interface HttpEndpoint {
    get?    (req: Request) : Response;
    post?   (req: Request) : Response;
    put?    (req: Request) : Response;
    delete? (req: Request) : Response;
}

export class Router {
    _routes: {[route: string] : HttpEndpoint | null} = {};

    /// 
    Route(req: Request) : Response {
        
        const url = new URL(req.url);
        

        const route = this._routes[url.pathname];

        if (route == null) {return new Response("404 - Not Found", {status: 404});}

        switch (req.method) {
            case "GET":     if (route.get)    {return route.get(req)}    break;
            case "POST":    if (route.post)   {return route.post(req)}   break;
            case "PUT":     if (route.put)    {return route.put(req)}    break;
            case "DELETE":  if (route.delete) {return route.delete(req)} break;
        }

        return new Response("404 - Not Found", {status: 404});
    }

    SetEndpoint(pathname: string, endpoint: HttpEndpoint) {
        this._routes[pathname] = endpoint;
    } 

    RemoveEndpoint(pathname: string) {
        this._routes[pathname] = null;
    }
}