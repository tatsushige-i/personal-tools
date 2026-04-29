import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

type Props = {
  code: number;
  className?: string;
  label?: string;
};

export function WeatherIcon({ code, className, label }: Props) {
  const ariaProps = label
    ? { "aria-label": label, role: "img" as const }
    : { "aria-hidden": true as const };

  if (code === 0 || code === 1) return <Sun className={className} {...ariaProps} />;
  if (code === 2) return <CloudSun className={className} {...ariaProps} />;
  if (code === 3) return <Cloud className={className} {...ariaProps} />;
  if (code === 45 || code === 48)
    return <CloudFog className={className} {...ariaProps} />;
  if (code >= 51 && code <= 57)
    return <CloudDrizzle className={className} {...ariaProps} />;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return <CloudRain className={className} {...ariaProps} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return <CloudSnow className={className} {...ariaProps} />;
  if (code === 95) return <CloudLightning className={className} {...ariaProps} />;
  if (code === 96 || code === 99)
    return <CloudHail className={className} {...ariaProps} />;
  return <Cloud className={className} {...ariaProps} />;
}
