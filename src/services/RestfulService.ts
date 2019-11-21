import fetch from "fetch-retry";

type UrlParts = string | number | (string | number)[];

export interface RestfulService {
  delete<T = any>(path?: UrlParts): Promise<T>;
  get<T = any>(path?: UrlParts): Promise<T>;
  patch<T = any>(path?: UrlParts, data?: object): Promise<T>;
  post<T = any>(path?: UrlParts, data?: object): Promise<T>;
  put<T = any>(path?: UrlParts, data?: object): Promise<T>;
}

export abstract class RestfulService {
  constructor(protected readonly baseUrl: string) {
    const fetchFactory = method => <T = any>(path?: UrlParts, data?: object) =>
      fetch(
        []
          .concat(baseUrl)
          .concat(path)
          .join("/"),
        {
          method,
          body: JSON.stringify(data)
        }
      ).then(resp => (resp.json() as unknown) as T);

    this.get = fetchFactory("GET");
    this.delete = fetchFactory("DELETE");
    this.patch = fetchFactory("PATCH");
    this.post = fetchFactory("POST");
    this.put = fetchFactory("PUT");
  }
}
