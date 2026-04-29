"use client";

import { useCallback, useEffect, useState } from "react";

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export type GeolocationState = {
  status: GeolocationStatus;
  coords: { latitude: number; longitude: number } | null;
  errorMessage: string | null;
};

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60_000,
  timeout: 10_000,
};

function isSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
}

function initialState(autoRequest: boolean): GeolocationState {
  if (!isSupported()) {
    return { status: "unsupported", coords: null, errorMessage: null };
  }
  return autoRequest
    ? { status: "loading", coords: null, errorMessage: null }
    : { status: "idle", coords: null, errorMessage: null };
}

export function useGeolocation(autoRequest = true): GeolocationState & {
  request: () => void;
} {
  const [state, setState] = useState<GeolocationState>(() =>
    initialState(autoRequest)
  );

  const request = useCallback(() => {
    if (!isSupported()) {
      setState({ status: "unsupported", coords: null, errorMessage: null });
      return;
    }
    setState({ status: "loading", coords: null, errorMessage: null });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          errorMessage: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? "denied" : "error",
          coords: null,
          errorMessage: err.message,
        });
      },
      POSITION_OPTIONS
    );
  }, []);

  useEffect(() => {
    if (!autoRequest || !isSupported()) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          errorMessage: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? "denied" : "error",
          coords: null,
          errorMessage: err.message,
        });
      },
      POSITION_OPTIONS
    );
  }, [autoRequest]);

  return { ...state, request };
}
