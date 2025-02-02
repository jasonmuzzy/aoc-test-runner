import fs from 'node:fs/promises';

import * as cheerio from 'cheerio';

import { Egdb, getExamples } from '../src/examples';
import { getPuzzle, isNumChar } from '../src/site';

// Prints all the colors in the terminal
function printColors() {
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 10; j++) {
            const n = 10 * i + j;
            if (n > 108) break;
            process.stdout.write(`\x1b[${n}m ${n.toString().padStart(3, ' ')}\x1b[0m`);
        }
        console.log();
    }
}
// printColors();

// // Write out example files
async function writeExampleFiles(year: number, dayFrom: number, dayTo: number) {
    await fs.mkdir(`./examples/${year}`, { recursive: true });
    for (let day = dayFrom; day <= dayTo; ++day) {
        const puzzle = await getPuzzle(year, day);
        const $ = cheerio.load(puzzle);
        const examples = await getExamples(year, day, false, $);
        await fs.writeFile(`./examples/${year}/${day}.json`, JSON.stringify(examples), { encoding: "utf-8" });
    }
}
// writeExampleFiles(2024, 1, 25).then(() => console.log('Done')).catch(error => console.error(error));

// Find arrays, literals and functions in egdb
async function findLiterals() {
    const years = (await fs.readdir('./egdb')).filter(year => isNumChar(year)).map(year => parseInt(year)).sort((a, b) => a - b);
    for (const year of years) {
        const days = (await fs.readdir(`./egdb/${year}`))
            .map(file => file.substring(0, file.indexOf('.')))
            .filter(file => isNumChar(file))
            .map(file => parseInt(file))
            .sort((a, b) => a - b);
        for (const day of days) {
            const egdb = JSON.parse(await fs.readFile(`./egdb/${year}/${day}.json`, { encoding: 'utf-8' })) as Egdb;
            egdb.inputs.indexes.forEach((v, i) => {
                if (typeof v === 'string') console.log(`inputs ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`inputs ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.inputs.transforms) console.log(`inputs ${year} day ${day}: "${JSON.stringify(egdb.inputs.transforms)}"`);
            egdb.answers.indexesOrLiterals.forEach((v, i) => {
                if (typeof v === 'string') console.log(`answers ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`answers ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.answers.transforms) console.log(`answers ${year} day ${day}: "${JSON.stringify(egdb.answers.transforms)}"`);
            egdb.additionalInfos?.indexes.forEach((v, i) => {
                if (typeof v === 'string') console.log(`additionalInfos ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`additionalInfos ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.additionalInfos?.transforms) console.log(`additionalInfos ${year} day ${day}: "${JSON.stringify(egdb.additionalInfos.transforms)}"`);
        }
    };
}
// findLiterals().then(() => console.log('Done')).catch(error => console.error(error));

// Print one example
async function getExample() {
    const puzzle = await getPuzzle(2020, 4);
    const $ = cheerio.load(puzzle);
    return $('code:eq(56)').text();
}
// getExample().then(example => console.log(`"${example}"`)).catch(error => console.error(error));