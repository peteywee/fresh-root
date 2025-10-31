import { writeFile, readFile } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const RBAC_CONTENT = `import { z } from "zod";

export const OrgRole = z.enum(["org_owner","admin","manager","scheduler","staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

export const UserClaims = z.object({
  uid: z.string(),
  orgId: z.string(),
  roles: z.array(OrgRole).nonempty()
});
export type UserClaims = z.infer<typeof UserClaims>;

export const Membership = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole),
  createdAt: z.number(),
  updatedAt: z.number()
});
export type Membership = z.infer<typeof Membership>;
`;

export async function ensureRBAC({
  root,
  force,
  planOnly,
}: {
  root: string;
  force: boolean;
  planOnly: boolean;
}) {
  const target = join(root, "packages/types/src/rbac.ts");
  const idx = join(root, "packages/types/src/index.ts");

  const write = async (file: string, content: string) => {
    if (!existsSync(dirname(file))) mkdirSync(dirname(file), { recursive: true });
    if (planOnly) return;
    await writeFile(file, content, "utf8");
  };

  if (!existsSync(target) || force) {
    await write(target, RBAC_CONTENT);
  }
  // Ensure index export
  let indexContent = "";
  if (existsSync(idx)) {
    indexContent = await readFile(idx, "utf8");
    if (!indexContent.includes(`export * from "./rbac";`)) {
      indexContent += `\nexport * from "./rbac";\n`;
      if (!planOnly) await writeFile(idx, indexContent, "utf8");
    }
  } else {
    indexContent = `export * from "./rbac";\n`;
    await write(idx, indexContent);
  }

  // Ensure package.json for types package
  const pkg = join(root, "packages/types/package.json");
  if (!existsSync(pkg) || force) {
    const content = {
      name: "@fresh-schedules/types",
      version: "0.0.0",
      private: true,
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      scripts: {
        build: "tsc -p tsconfig.json",
      },
    };
    await write(pkg, JSON.stringify(content, null, 2));
  }

  // Ensure tsconfig
  const tsconfig = join(root, "packages/types/tsconfig.json");
  if (!existsSync(tsconfig) || force) {
    const content = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        declaration: true,
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        moduleResolution: "Node",
      },
      include: ["src"],
    };
    await write(tsconfig, JSON.stringify(content, null, 2));
  }
}
