import { observable } from "mobx";
import { NotificationType } from "../model";

export class DiagnosticsPageState {
  @observable url = "http://localhost:8080/contacts";
  @observable method = "GET";
  @observable statusCode: number = null;

  @observable response: { message: string; type: NotificationType } = null;

  executeAjaxRequest = async (type: "fetch" | "jQuery" = "fetch") => {
    this.response = { message: "Loading...", type: "info" };

    let url = this.url;

    if (this.statusCode) {
      url += `?chaos=${this.statusCode}`;
    }

    const requestExecutor =
      type === "jQuery" ? this.executeJQueryRequest : this.executeFetchRequest;

    requestExecutor(
      url,
      this.method,
      () => (this.response = { message: "Success", type: "success" }),
      error => (this.response = { message: error, type: "danger" })
    );
  };

  private executeJQueryRequest = (url, method, success, error) =>
    $.ajax({
      url,
      method,
      success,
      error
    });

  private executeFetchRequest = (url, method, success, error) =>
    fetch(url, { method })
      .then(resp => {
        if (!resp.ok) {
          throw Error(`${resp.status} - ${resp.statusText}`);
        }

        return resp.json();
      })
      .then(success)
      .catch(error);
}
