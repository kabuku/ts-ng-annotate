// MIT licensed, see LICENSE.ng-annotate file
// Copyright (c) 2013-2016 Olov Lassus <olov.lassus@gmail.com>
import * as diff from "diff";
import { readFileSync } from "fs";
import * as glob from "glob";
import * as ts from "typescript";

import { runNgAnnotate } from "./ts-ng-annotate-main";

function test(fileNames: string[]): void {
    runNgAnnotate(fileNames, {}, (fileName, actual) => {
        const expected = readFileSync(getExpectedFileName(fileName)).toString();
        if (expected !== actual) {
            const patch = diff.createPatch(fileName, expected, actual);
            process.stderr.write(patch);
            process.exit(-1);
        }
    });
}

function getExpectedFileName(fileName: string) {
    if (/\.annotated\.ts$/.test(fileName)) {
        return fileName;
    } else {
        return fileName.slice(0, -3) + ".annotated.ts";
    }
}

function main(): void {
    test(glob.sync("./tests/!(*.annotated).ts"));
    test(glob.sync("./tests/*.annotated.ts"));
}

main();
