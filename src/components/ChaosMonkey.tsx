import React, { useCallback, useState, useEffect } from "react";
import clsx from "clsx";
import { IoIosBulb as BulbIcon } from "react-icons/io";

const fetchChaosMonkey = async (enabled?: boolean) => {
  let url = "http://localhost:8080/chaos";

  if (enabled != null) {
    url += `?enabled=${enabled}`;
  }

  const { chaosEnabled } = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" })
  }).then(x => x.json());

  return chaosEnabled;
};

export const ChaosMonkey = () => {
  const [chaosEnabled, setChaosEnabled] = useState();

  const toggleChaosMonkey = useCallback(() => {
    fetchChaosMonkey(!chaosEnabled).then(setChaosEnabled);
  }, [chaosEnabled, setChaosEnabled]);

  useEffect(() => {
    fetchChaosMonkey().then(setChaosEnabled);
  }, []);

  return (
    <div
      className={clsx("chaos-monkey", {
        hide: chaosEnabled == null,
        enabled: chaosEnabled,
        disabled: !chaosEnabled
      })}
    >
      <button role="button" className="btn btn-light" onClick={toggleChaosMonkey}>
        <BulbIcon style={{ color: chaosEnabled ? "green" : "red" }} />
        Chaos Monkey
      </button>
    </div>
  );
};
