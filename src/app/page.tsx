import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Tool = {
  name: string;
  description: string;
  href: string;
};

const tools: Tool[] = [
  // Add tools here:
  // { name: "Example Tool", description: "Description", href: "/tools/example" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Personal Tools</h1>
      <p className="mt-2 text-muted-foreground">
        A collection of utility tools.
      </p>

      {tools.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No tools yet. Add your first tool to get started.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
