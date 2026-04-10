import { buildWifiString } from "../wifi-format";

describe("buildWifiString", () => {
  it("builds a standard WPA config", () => {
    const result = buildWifiString({
      ssid: "MyNetwork",
      password: "secret123",
      encryption: "WPA",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA;S:MyNetwork;P:secret123;;");
  });

  it("builds a WEP config", () => {
    const result = buildWifiString({
      ssid: "OldNet",
      password: "wepkey",
      encryption: "WEP",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WEP;S:OldNet;P:wepkey;;");
  });

  it("omits password for open networks", () => {
    const result = buildWifiString({
      ssid: "FreeWifi",
      password: "",
      encryption: "nopass",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:nopass;S:FreeWifi;;");
  });

  it("includes H:true for hidden networks", () => {
    const result = buildWifiString({
      ssid: "HiddenNet",
      password: "pass",
      encryption: "WPA",
      hidden: true,
    });
    expect(result).toBe("WIFI:T:WPA;S:HiddenNet;P:pass;H:true;;");
  });

  it("escapes special characters in SSID", () => {
    const result = buildWifiString({
      ssid: 'My;Net:work,"test\\',
      password: "pass",
      encryption: "WPA",
      hidden: false,
    });
    expect(result).toBe(
      'WIFI:T:WPA;S:My\\;Net\\:work\\,\\"test\\\\;P:pass;;'
    );
  });

  it("escapes special characters in password", () => {
    const result = buildWifiString({
      ssid: "Net",
      password: "p;a:s,s",
      encryption: "WPA",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA;S:Net;P:p\\;a\\:s\\,s;;");
  });
});
