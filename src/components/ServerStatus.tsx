import React, { useState, useEffect, useCallback } from "react";

export const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState();

  const setServerStatusFromResponse = async resp => {
    if ("json" in resp) {
      setServerStatus(String(await resp.json()));
    }
  };

  useEffect(() => {
    fetch("http://localhost:8080/status/current", { method: "POST" })
      .then(setServerStatusFromResponse)
      .catch(setServerStatusFromResponse);
  }, []);

  const updateServerStatus = useCallback(status => {
    fetch(`http://localhost:8080/status/current?code=${status}`, {
      method: "POST"
    })
      .then(setServerStatusFromResponse)
      .catch(setServerStatusFromResponse);
  }, []);

  return (
    <div>
      <label style={{ paddingRight: 5 }} htmlFor="serverStatus">
        API Status:
      </label>
      <select
        id="serverStatus"
        value={serverStatus}
        onChange={evt => updateServerStatus(evt.target.value)}
        disabled={serverStatus == null}
      >
        <option>200</option>
        <option>300</option>
        <option>400</option>
        <option>500</option>
      </select>
    </div>
  );
};
