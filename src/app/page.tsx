import Link from "next/link";
import { ArrowRight, Package, type LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
};

const tools: Tool[] = [
  // Add tools here:
  // { name: "Example Tool", description: "Description", href: "/tools/example", icon: Wrench },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Personal Tools</h1>
      <p className="mt-2 text-muted-foreground">
        A collection of utility tools.
      </p>

      {tools.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No tools yet. Add your first tool to get started.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="group transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="flex items-center justify-between">
                        {tool.name}
                        <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
