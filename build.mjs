import fs from "fs";
import { execSync } from "child_process";
import { minify } from "minify";
import { Packer } from "roadroller";
import { zip, COMPRESSION_LEVEL } from "zip-a-folder";

(async () => {
  console.log("Remove previous entry files...");
  fs.rmSync("./entry", { recursive: true, force: true });
  fs.rmSync("./entry.zip", { force: true });

  console.log("Get project files content...");

  let indexHTML = fs.readFileSync("./index.html", "utf8");

  let styleCSS = fs.readFileSync("./style.css", "utf8");

  let indexJS = fs.readFileSync("./index.js", "utf8");

  console.log("Minify JS...");
  const minifiedJS = await minify.js(indexJS);

  console.log("Minify CSS...");
  const minifiedCSS = await minify.css(styleCSS);

  console.log("Minify HTML...");
  indexHTML = indexHTML
    .replace(
      '<script src="./index.js"></script>',
      `<script>${minifiedJS}</script>`
    )
    .replace(
      '<link href="./style.css" rel="stylesheet" />',
      `<style>${minifiedCSS}</style>`
    )
    .replace("./favicon.png", "./f.png")
    .replaceAll("ground.png", "g.png")
    .replaceAll("front.svg", "f.svg")
    .replaceAll("back.svg", "b.svg")
    .replaceAll("sprites.png", "s.png")
    .replaceAll("tower.png", "t.png")

    .replaceAll("tower-container", "t-c")
    .replaceAll("destroying-floor", "d-f")
    .replaceAll("tower-floor", "t-f")
    .replaceAll("floor-value", "f-v")

    .replaceAll("data-tuto", "data-t")
    .replaceAll("dataset.tuto", "dataset.t")
    .replaceAll("data-section", "data-s")
    .replaceAll("dataset.section", "dataset.s")
    .replaceAll("dataset.value", "dataset.v")
    .replaceAll("data-element", "data-e")
    .replaceAll("dataset.element", "dataset.e")

    .replaceAll("--scrollX", "--sx")
    .replaceAll("--initialX", "--ix")
    .replaceAll("--initialY", "--iy")
    .replaceAll("--from", "--f")
    .replaceAll("--to", "--t")
    .replaceAll("--rotate", "--r")
    .replaceAll("--scale", "--s")
    .replaceAll("--shadow", "--sh");

  const ids = [...indexHTML.matchAll(/id="([^"]*?)"/g)];

  ids.forEach((id, i) => {
    if (id.length > 5) {
      indexHTML = indexHTML.replaceAll(id[1], "_" + i);
    }
  });

  const minifiedHTML = await minify.html(indexHTML);

  console.log("Pack project...");
  const inputToPack = [
    {
      data: minifiedHTML,
      type: "text",
      action: "write",
    },
  ];

  const packer = new Packer(inputToPack);
  await packer.optimize();

  const packedCode = packer.makeDecoder();

  console.log("Write entry files...");

  fs.mkdirSync("./entry");
  fs.cpSync("./favicon.png", "./entry/f.png");
  fs.cpSync("./ground.png", "./entry/g.png");
  fs.cpSync("./front.svg", "./entry/f.svg");
  fs.cpSync("./back.svg", "./entry/b.svg");
  fs.cpSync("./sprites.png", "./entry/s.png");
  fs.cpSync("./tower.png", "./entry/t.png");

  fs.writeFileSync(
    "./entry/index.html",
    `<script>${packedCode.firstLine + packedCode.secondLine}</script>`,
    { encoding: "utf8" }
  );

  console.log("Zip entry folder...");
  await zip("./entry", "./entry.zip", { compression: COMPRESSION_LEVEL.high });

  console.log("Compress zip...");
  try {
    await execSync("ect.exe -9 -zip ./entry.zip", { env: process.env });
  } catch (e) {
    console.warn(
      "⚠ Cannot compress zip, please be sure ect.exe is installed and available from global scope"
    );
  }

  console.log("Get entry size...");
  const { size } = fs.statSync("./entry.zip");

  console.log("Entry size: " + size + " bytes");

  const JS13K_LIMIT_SIZE = 13312;

  if (size > JS13K_LIMIT_SIZE) {
    console.error("❌ File is " + (size - JS13K_LIMIT_SIZE) + "bytes too big!");
  } else {
    const percent = Math.round(((size * 100) / JS13K_LIMIT_SIZE) * 100) / 100;
    console.log("✅ All good! (" + percent + "% of total budget)");
  }

  console.log("");
  console.log("Entry generated");
})();
