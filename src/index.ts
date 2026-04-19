#!/usr/bin/env node

import fs from "fs";
import path from "path";
import prompts from "prompts";

import { execSync } from "child_process";

type Architecture = "none" | "modular";

function copyTemplateTree(templateRoot: string, projectRoot: string): void {
  if (!fs.existsSync(templateRoot)) {
    throw new Error(`Plantillas no encontradas: ${templateRoot}`);
  }

  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);

      if (ent.isDirectory()) {
        walk(abs);
      } else if (ent.name.endsWith(".txt")) {
        const rel = path.relative(templateRoot, abs);
        const destRel = rel.slice(0, -4);
        const dest = path.join(projectRoot, destRel);

        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, fs.readFileSync(abs, "utf-8"));
      }
    }
  };

  walk(templateRoot);
}

async function main() {
  console.clear();

  const { default: boxen } = await import("boxen");

  const questionBox = (
    title: string,
    body: string,
    opts?: { compactTop?: boolean },
  ) =>
    boxen(body, {
      title,
      titleAlignment: "left",
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: opts?.compactTop ? 0 : 1, bottom: 0 },
      borderStyle: "round",
      borderColor: "magentaBright",
      float: "left",
    });

  const phase = (icon: string, label: string) => {
    console.log(`\n  ${icon}  ${label}\n`);
  };

  console.log(
    boxen("Te guiamos en unas preguntas y generamos la carpeta del proyecto.", {
      title: "✨ Craft Node",
      titleAlignment: "left",
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyanBright",
      float: "left",
    }),
  );

  console.log(
    questionBox(
      "Ingresa el nombre del proyecto",
      'Nombre de la carpeta y del campo "name" en package.json.',
      { compactTop: true },
    ),
  );

  const projectAnswer = await prompts({
    type: "text",
    name: "projectName",
    message: "Nombre de proyecto",
    validate: (value: string) =>
      value.trim().length > 0 || "Escribe un nombre.",
  });

  console.log(
    questionBox(
      "Selecciona un lenguaje",
      "TypeScript aporta tipos estáticos; JavaScript es la opción más directa.",
    ),
  );

  const languageAnswer = await prompts({
    type: "select",
    name: "language",
    message: "Elige una opción",
    choices: [
      { title: "TypeScript", value: "ts" },
      { title: "JavaScript", value: "js" },
    ],
  });

  console.log(
    questionBox(
      "¿Deseas trabajar con Express?",
      "Express es un framework minimalista para APIs y rutas HTTP.",
    ),
  );

  const expressAnswer = await prompts({
    type: "confirm",
    name: "express",
    message: "¿Incluir Express?",
    initial: true,
  });

  console.log(
    questionBox(
      "¿Deseas comenzar con una arquitectura modular?",
      "La arquitectura modular separa rutas y piezas reutilizables. Sin arquitectura se mantiene un único punto de entrada.",
    ),
  );

  const architectureAnswer = await prompts({
    type: "confirm",
    name: "architecture",
    message: "¿Iniciar con arquitectura modular?",
    initial: true,
  });

  const projectName = projectAnswer.projectName?.trim();

  if (!projectName) {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  const ext = languageAnswer.language;

  if (ext !== "ts" && ext !== "js") {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  if (expressAnswer.express === undefined) {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  const useExpress = expressAnswer.express;

  if (architectureAnswer.architecture === undefined) {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  const selectedArchitecture: Architecture = architectureAnswer.architecture
    ? "modular"
    : "none";

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(
      boxen(`Ya existe una carpeta llamada "${projectName}".`, {
        title: "Error",
        titleAlignment: "left",
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 1, bottom: 0 },
        borderStyle: "single",
        borderColor: "redBright",
        float: "left",
      }),
    );

    process.exit(1);
  }

  fs.mkdirSync(projectPath);

  const folder = useExpress ? "express" : "nodejs";
  const fileName = useExpress ? `express-${ext}.txt` : `node-${ext}.txt`;

  if (selectedArchitecture === "none") {
    fs.mkdirSync(path.join(projectPath, "src"));

    const templatePath = path.join(
      __dirname,
      "..",
      "src",
      "templates",
      folder,
      fileName,
    );

    const content = fs.readFileSync(templatePath, "utf-8");

    fs.writeFileSync(path.join(projectPath, "src", `index.${ext}`), content);
  } else {
    const templateRoot = path.join(
      __dirname,
      "..",
      "src",
      "templates",
      folder,
      selectedArchitecture,
      ext,
    );

    copyTemplateTree(templateRoot, projectPath);
  }

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  if (useExpress) {
    dependencies.express = "^4.21.2";
  }

  if (ext === "ts") {
    devDependencies.typescript = "^5.7.3";
    devDependencies["ts-node"] = "^10.9.2";
    devDependencies["@types/node"] = "^22.10.5";

    if (useExpress) {
      devDependencies["@types/express"] = "^5.0.0";
    }
  }

  const entryFile =
    selectedArchitecture === "modular"
      ? `src/server.${ext}`
      : `src/index.${ext}`;

  const packageJson: Record<string, unknown> = {
    name: projectName,
    version: "1.0.0",
    main: entryFile,
    scripts: {
      start: ext === "ts" ? `ts-node ${entryFile}` : `node ${entryFile}`,
    },
  };

  if (Object.keys(dependencies).length > 0) {
    packageJson.dependencies = dependencies;
  }

  if (Object.keys(devDependencies).length > 0) {
    packageJson.devDependencies = devDependencies;
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  if (ext === "ts") {
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["src/**/*.ts"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );
  }

  console.log(
    boxen(`Proyecto creado · ${projectName}\n📁 ${projectPath}`, {
      title: "¡Todo está listo!",
      titleAlignment: "left",
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 0 },
      borderStyle: "round",
      borderColor: "greenBright",
      float: "left",
    }),
  );

  console.log(
    questionBox(
      "¿Deseas instalar dependencias e inicializar el proyecto?",
      "Instala dependencias en node_modules y ejecuta npm start para comprobar que todo arranca.",
    ),
  );

  const followUp = await prompts({
    type: "confirm",
    name: "installAndRun",
    message: "¿Ejecutar ahora?",
    initial: true,
  });

  if (followUp.installAndRun === undefined) {
    console.log("Operación cancelada.");
    process.exit(0);
  }

  if (followUp.installAndRun) {
    try {
      phase("⚡", "npm install");
      execSync("npm install", { cwd: projectPath, stdio: "inherit" });

      phase("🚀", "npm start");
      execSync("npm start", { cwd: projectPath, stdio: "inherit" });
    } catch {
      console.error(
        boxen("Revisa la salida de npm (red, permisos o dependencias).", {
          title: "Error",
          titleAlignment: "left",
          padding: { top: 0, bottom: 0, left: 1, right: 1 },
          margin: { top: 1, bottom: 0 },
          borderStyle: "single",
          borderColor: "redBright",
          float: "left",
        }),
      );

      process.exit(1);
    }
  } else {
    console.log(
      boxen(`cd ${projectName}\nnpm install\nnpm start`, {
        title: "¡Todo preparado! Ahora, haz lo siguiente",
        titleAlignment: "left",
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 1, bottom: 0 },
        borderStyle: "single",
        borderColor: "whiteBright",
        float: "left",
      }),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
