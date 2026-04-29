import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeolocation } from "../use-geolocation";

type MockGeo = {
  getCurrentPosition: jest.Mock;
};

function setNavigatorGeolocation(geolocation: MockGeo | undefined) {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: geolocation,
  });
}

describe("useGeolocation", () => {
  afterEach(() => {
    setNavigatorGeolocation(undefined);
  });

  it("transitions to granted on success", async () => {
    const getCurrentPosition = jest.fn(
      (success: PositionCallback) => {
        success({
          coords: {
            latitude: 35.5,
            longitude: 139.5,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      }
    );
    setNavigatorGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation(true));

    await waitFor(() => expect(result.current.status).toBe("granted"));
    expect(result.current.coords).toEqual({ latitude: 35.5, longitude: 139.5 });
  });

  it("transitions to denied when permission is denied", async () => {
    const getCurrentPosition = jest.fn(
      (_success: PositionCallback, error?: PositionErrorCallback) => {
        error?.({
          code: 1,
          message: "User denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }
    );
    setNavigatorGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation(true));

    await waitFor(() => expect(result.current.status).toBe("denied"));
    expect(result.current.coords).toBeNull();
    expect(result.current.errorMessage).toBe("User denied");
  });

  it("transitions to error for non-permission failures", async () => {
    const getCurrentPosition = jest.fn(
      (_success: PositionCallback, error?: PositionErrorCallback) => {
        error?.({
          code: 2,
          message: "unavailable",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }
    );
    setNavigatorGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation(true));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBe("unavailable");
  });

  it("returns 'unsupported' when navigator.geolocation is undefined", () => {
    setNavigatorGeolocation(undefined);

    const { result } = renderHook(() => useGeolocation(true));
    expect(result.current.status).toBe("unsupported");
  });

  it("does not auto-request when autoRequest is false", () => {
    const getCurrentPosition = jest.fn();
    setNavigatorGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation(false));
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");

    act(() => {
      result.current.request();
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});
