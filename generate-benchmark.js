import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_COUNT = process.env.COMPONENT_COUNT
  ? parseInt(process.env.COMPONENT_COUNT)
  : 1_000;
const PAGE_COUNT = process.env.PAGE_COUNT
  ? parseInt(process.env.PAGE_COUNT)
  : 1_000;
const COMPONENTS_PER_PAGE = process.env.COMPONENTS_PER_PAGE
  ? parseInt(process.env.COMPONENTS_PER_PAGE)
  : 100;

const componentName = (i) => `Component${i.toString().padStart(4, "0")}`;
const pageName = (i) => `page-${i.toString().padStart(4, "0")}`;

async function generateComponents(baseDir) {
  console.log("🧱 Generating components...");
  const componentsDir = path.join(baseDir, "components");
  await fs.mkdir(componentsDir, { recursive: true });

  const jobs = [];
  for (let i = 1; i <= COMPONENT_COUNT; i++) {
    const name = componentName(i);
    const code = `export default function ${name}() {
  return <div>${name}</div>;
}
`;
    const filePath = path.join(componentsDir, `${name}.tsx`);
    jobs.push(fs.writeFile(filePath, code));
    if (i % 100 === 0) console.log(`  ✔️  ${i} components generated...`);
  }
  await Promise.all(jobs);
}

async function generatePages(baseDir) {
  console.log("📄 Generating pages...");
  const appDir = path.join(baseDir, "app");
  const pages = [];

  for (let i = 1; i <= PAGE_COUNT; i++) {
    const pageDir = path.join(appDir, pageName(i));
    await fs.mkdir(pageDir, { recursive: true });

    const usedIndices = new Set();
    while (usedIndices.size < COMPONENTS_PER_PAGE) {
      usedIndices.add(Math.floor(Math.random() * COMPONENT_COUNT) + 1);
    }
    const imports = [...usedIndices]
      .map((idx, j) => {
        const name = componentName(idx);
        return `import C${j} from "@/components/${name}";`;
      })
      .join("\n");

    const jsx = [...Array(COMPONENTS_PER_PAGE).keys()]
      .map((j) => `      <C${j} />`)
      .join("\n");

    const pageCode = `${imports}

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div>
${jsx}
    </div>
  );
}
`;

    const filePath = path.join(pageDir, "page.tsx");
    await fs.writeFile(filePath, pageCode);
    if (i % 100 === 0) console.log(`  📄 ${i} pages generated...`);
  }
}

async function main() {
  await generateComponents(__dirname);
  await generatePages(__dirname);

  console.log("✅ Done! Benchmark app ready");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
