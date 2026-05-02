import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCoordinates,
  formatLocation,
  formatTimezone,
} from "../lib/format";
import type { IpInfo } from "../lib/types";

type Props = {
  info: IpInfo;
  title?: string;
};

export function IpInfoCard({ info, title }: Props) {
  const coords = formatCoordinates(info);
  const tz = formatTimezone(info);
  const mapHref =
    coords && info.latitude !== null && info.longitude !== null
      ? `https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}#map=10/${info.latitude}/${info.longitude}`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="font-mono">{info.ip || "不明"}</span>
          {info.version && <Badge variant="secondary">{info.version}</Badge>}
        </CardTitle>
        {title && (
          <p className="text-sm text-muted-foreground">{title}</p>
        )}
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
          <DataRow label="場所" value={formatLocation(info)} />
          {info.postal && <DataRow label="郵便番号" value={info.postal} />}
          {tz && <DataRow label="タイムゾーン" value={tz} />}
          {info.org && <DataRow label="ISP / 組織" value={info.org} />}
          {info.asn && <DataRow label="ASN" value={info.asn} />}
          {coords && (
            <DataRow
              label="緯度経度"
              value={
                mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {coords}
                  </a>
                ) : (
                  coords
                )
              }
            />
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words">{value}</dd>
    </>
  );
}
