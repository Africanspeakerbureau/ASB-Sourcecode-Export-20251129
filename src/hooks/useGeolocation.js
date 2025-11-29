import React from "react";

export function useGeolocation(enabled) {
  const [position, setPosition] = React.useState(null);
  const [error, setError] = React.useState(null);

  const request = React.useCallback(() => {
    if (!enabled || !("geolocation" in navigator)) return;

    const go = () => navigator.geolocation.getCurrentPosition(
      (pos) => setPosition(pos),
      (err) => setError(err?.message || "geolocation error"),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );

    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: "geolocation" }).then(p => {
        if (p.state === "denied") { setError("denied"); return; }
        go();
      }).catch(go);
    } else {
      go();
    }
  }, [enabled]);

  return { position, error, request };
}
