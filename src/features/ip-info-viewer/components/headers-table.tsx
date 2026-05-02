import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  headers: Record<string, string>;
};

const HEADER_LABELS: Record<string, string> = {
  "user-agent": "User-Agent",
  accept: "Accept",
  "accept-language": "Accept-Language",
  "accept-encoding": "Accept-Encoding",
  "sec-ch-ua": "Sec-CH-UA",
  "sec-ch-ua-mobile": "Sec-CH-UA-Mobile",
  "sec-ch-ua-platform": "Sec-CH-UA-Platform",
  dnt: "DNT",
  "upgrade-insecure-requests": "Upgrade-Insecure-Requests",
  referer: "Referer",
  connection: "Connection",
};

export function HeadersTable({ headers }: Props) {
  const entries = Object.entries(headers);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">HTTPヘッダー</CardTitle>
        <p className="text-sm text-muted-foreground">
          このページへのリクエストでブラウザが送信した主要ヘッダー一覧です。
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            表示できるヘッダーはありませんでした。
          </p>
        ) : (
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            {entries.map(([name, value]) => (
              <div key={name} className="contents">
                <dt className="text-muted-foreground">
                  {HEADER_LABELS[name] ?? name}
                </dt>
                <dd className="break-all font-mono text-xs sm:text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
