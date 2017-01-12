/* @flow */

/* Client */
export type ClientRequest = {
  uri: string;
  method: MethodType;
  body?: string | Object;
  headers?: {
    [key: string]: string;
  }
}
export type HttpErrorType = {
  name: string;
  message: string;
  code: number;
  status: number;
  statusCode: number;
  originalRequest: ClientRequest;
  body?: Object;
  headers?: {
    [key: string]: string;
  }
}
export type ClientResponse = {
  resolve(): void;
  reject(): void;
  body?: Object;
  error?: HttpErrorType;
  statusCode: number;
}

// eslint-disable-next-line max-len
export type Dispatch = (request: ClientRequest, response: ClientResponse) => any;
export type Middleware = (next: Dispatch) => Dispatch;

export type ClientOptions = {
  middlewares?: Array<Middleware>;
}
export type ClientResult = {
  body: ?Object;
  statusCode: number;
} | HttpErrorType
export type Client = {
  execute: (request: ClientRequest) => Promise<ClientResult>;
}


/* Middlewares */
export type AuthMiddlewareOptions = {
  host?: string;
  projectKey: string;
  credentials: {
    clientId: string;
    clientSecret: string;
  };
  scopes: Array<string>;
}
export type HttpMiddlewareOptions = {
  host?: string;
}
export type QueueMiddlewareOptions = {
  concurrency?: number;
}
export type UserAgentMiddlewareOptions = {
  name?: string;
  version?: string;
  url?: string;
}


/* API Request Builder */
export type ServiceBuilderDefaultParams = {
  expand: Array<string>;
  pagination: {
    page: ?number;
    perPage: ?number;
    sort: Array<string>;
  };
  id?: ?string;
  staged?: boolean;
  query?: {
    operator: 'and' | 'or';
    where: Array<string>;
  };
  search?: {
    facet: Array<string>;
    filter: Array<string>;
    filterByQuery: Array<string>;
    filterByFacets: Array<string>;
    fuzzy: boolean;
    text: ?{
      lang: string;
      value: string;
    };
  };
}
export type ServiceBuilder = {
  type: string;
  features: Array<string>;
  params: ServiceBuilderDefaultParams;
  build(): string;
}
export type ServiceBuilderDefinition = {
  type: string;
  endpoint: string;
  features: Array<string>;
}
export type ApiRequestBuilder = {
  [key: string]: ServiceBuilder;
}


/* HTTP User Agent */
export type HttpUserAgentOptions = {
  name: string;
  version?: string;
  libraryName?: string;
  libraryVersion?: string;
  contactUrl?: string;
  contactEmail?: string;
}


/* Sync Actions */
export type UpdateAction = {
  action: string;
  [key: string]: any;
}
export type SyncAction = {
  buildActions: (before: Object, now: Object) => Array<UpdateAction>;
}
export type ActionGroup = {
  type: string;
  group: 'black' | 'white';
}
