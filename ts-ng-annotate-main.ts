import { writeFileSync } from "fs";
import * as ts from "typescript";

import ngAnnotate from "./ts-ng-annotate";

type Callback = (fileName: string, source: string) => void;

export function runNgAnnotate(fileNames: string[], options: ts.CompilerOptions, callback: Callback): void {
    const host = ts.createCompilerHost({}, /* setParentNodes */ true);
    const program = ts.createProgram(fileNames, options, host);

    program.getSourceFiles().forEach((sourceFile) => {
        if (!sourceFile.isDeclarationFile) {
            const source = ngAnnotate(sourceFile);
            callback(sourceFile.fileName, source);
        }
    });
}

function main(): void {
    runNgAnnotate(process.argv.slice(2), {}, writeFileSync);
}

main();
