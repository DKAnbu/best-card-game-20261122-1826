/* EMBERFALL DUEL — entrypoint.
   Node 22, standard library only. It gathers this repository's game/ and
   screenshots/ into the output directory and writes dossier.json there,
   using the vendored make.fun library. The grader runs this program twice
   and the two runs must produce identical bytes.
   Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
     mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
*/
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

/* Caps from the bounty gate: only text_max_bytes changes the dossier's
   bytes; the rest make this program refuse exactly where the scorer would
   (too many or too heavy screenshots, game/ too large or too many files,
   a game path too long). */
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
