import React, { useState } from "react";
import { useObserver } from "mobx-react-lite";
import { DiagnosticsPageState } from "./DiagnosticsPageState";
import { FormField } from "../components/FormField";
import { AlertPanel } from "../components/AlertPanel";
import { RouteComponentProps } from "@reach/router";

export const DiagnosticsPage = (props: RouteComponentProps) => {
  const [settings] = useState(() => new DiagnosticsPageState());

  return useObserver(() => (
    <div className="container">
      <header className="row">
        <h2 className="col-md-12 title">AJAX Request Test Page</h2>
      </header>

      <form>
        <FormField label="URL" model={settings} name="url" />
        <FormField
          type="select"
          label="HTTP Method"
          model={settings}
          name="method"
        >
          <option>GET</option>
          <option>PUT</option>
          <option>POST</option>
          <option>DELETE</option>
        </FormField>
        <FormField
          type="number"
          label="Status Code"
          model={settings}
          name="statusCode"
        />
      </form>

      <fieldset>
        <h4>Response:</h4>
        {settings.response ? (
          <AlertPanel
            onClose={() => (settings.response = null)}
            message={settings.response.message}
            type={settings.response.type}
          />
        ) : (
          <div>
            <em>No response</em>
          </div>
        )}
      </fieldset>

      <div className="row">
        <div className="col-md-6 ">
          <button
            type="button"
            className="btn btn-info"
            onClick={() => settings.executeAjaxRequest("fetch")}
          >
            Trigger <code>fetch</code> AJAX request
          </button>
        </div>

        <div className="col-md-6 ">
          <button
            type="button"
            className="btn btn-info"
            onClick={() => settings.executeAjaxRequest("jQuery")}
          >
            Trigger <code>$.ajax</code> AJAX request
          </button>
        </div>
      </div>
    </div>
  ));
};
