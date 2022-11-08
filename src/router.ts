import { MethodNotSupported } from "./util.ts";

export interface HttpEndpoint {
    get?    (req: Request) : Response;
    post?   (req: Request) : Response;
    put?    (req: Request) : Response;
    delete? (req: Request) : Response;
}

export class Router {
    _routes: {[route: string] : HttpEndpoint | null} = {};
    _default_route: HttpEndpoint | null = null;
    /// 
    Route(req: Request) : Response {
        
        const url = new URL(req.url);
        

        let route = this._routes[url.pathname];

        if (route == null) {
            if (this._default_route == null) {
                return MethodNotSupported();
            }

            route = this._default_route;
        }

        switch (req.method) {
            case "GET":     if (route.get)    {return route.get(req)}    break;
            case "POST":    if (route.post)   {return route.post(req)}   break;
            case "PUT":     if (route.put)    {return route.put(req)}    break;
            case "DELETE":  if (route.delete) {return route.delete(req)} break;
        }
        return MethodNotSupported();
    }

    SetEndpoint(pathname: string, endpoint: HttpEndpoint) {
        this._routes[pathname] = endpoint;
    } 

    RemoveEndpoint(pathname: string) {
        this._routes[pathname] = null;
    }

    SetDefaultEndpoint(endpoint: HttpEndpoint) {
        this._default_route = endpoint;
    }
}