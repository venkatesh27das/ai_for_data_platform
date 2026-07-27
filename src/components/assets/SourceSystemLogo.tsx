import { Braces, Database } from "lucide-react";

type SourceSystemLogoProps = {
  className?: string;
  name: string;
  size?: "compact" | "default";
};

const logoAssets = [
  { match: "databricks", src: "/source-logos/databricks.svg" },
  { match: "sharepoint", src: "/source-logos/sharepoint.svg" },
  { match: "atlan", src: "/source-logos/atlan.png" },
  { match: "dbt", src: "/source-logos/dbt.png" },
  { match: "neo4j", src: "/source-logos/neo4j.svg" },
  { match: "snowflake", src: "/source-logos/snowflake.svg" },
] as const;

export function SourceSystemLogo({
  className = "",
  name,
  size = "default",
}: SourceSystemLogoProps) {
  const normalizedName = name.toLowerCase();
  const logo = logoAssets.find(({ match }) => normalizedName.includes(match));
  const classes = [
    "source-system-logo",
    `source-system-logo--${size}`,
    logo ? "" : "source-system-logo--generic",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (logo) {
    return (
      <span aria-hidden="true" className={classes}>
        <img alt="" src={logo.src} />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={classes}>
      {normalizedName.includes("api") ? <Braces size={17} /> : <Database size={17} />}
    </span>
  );
}
