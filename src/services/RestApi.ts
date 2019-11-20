type UrlParts = string | number | (string | number)[];

export class RestApi {
  constructor(private readonly baseUrl) {}

  delete = (path: UrlParts) =>
    fetch([this.baseUrl].concat(path).join("/"), {
      method: "DELETE"
    }).then(resp => resp.json());

  get = <T = any>(path?: UrlParts) =>
    fetch([this.baseUrl].concat(path).join("/")).then(
      resp => (resp.json() as unknown) as T
    );

  post = <T = any>(path: UrlParts, data: object) =>
    fetch([this.baseUrl].concat(path).join("/"), {
      method: "PUT",
      body: JSON.stringify(data)
    }).then(resp => (resp.json() as unknown) as T);

  put = <T = any>(path: UrlParts, data: object) =>
    fetch([this.baseUrl].concat(path).join("/"), {
      method: "PUT",
      body: JSON.stringify(data)
    }).then(resp => (resp.json() as unknown) as T);
}
