import * as ts from "typescript";

export default function ngAnnotate(sourceFile: ts.SourceFile): string {
    let source = sourceFile.text;

    getAnnotatingEdits(sourceFile)
        .sort((a, b) => b.span.start - a.span.start)
        .forEach(({ span, newText }) => {
            const head = source.slice(0, span.start);
            const tail = source.slice(span.start + span.length);
            source = head + newText + tail;
        });

    return source;
}

function getAnnotatingEdits(sourceFile: ts.SourceFile): ts.TextChange[] {
    const edits: ts.TextChange[] = [];

    function visit(node: ts.Node): void {
        if (isNgMethodCall(node)) {
            for (const argument of node.arguments) {
                if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) {
                    edits.push(...getEditsForFunction(argument));
                } else if (ts.isArrayLiteralExpression(argument)) {
                    edits.push(...fixNgAnnotatedFunction(argument));
                }
                ts.forEachChild(argument, visit);
            }
            ts.forEachChild(node.expression, visit);
            return;
        }
        if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && hasNgInjectPrologue(node.body)) {
            edits.push(...getEditsForFunction(node));
        } else if (ts.isClassDeclaration(node)) {
            edits.push(...getEditsForConstructor(node));
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return edits;
}

function fixNgAnnotatedFunction(node: ts.ArrayLiteralExpression): ts.TextChange[] {
    if (!node.elements.length) {
        return [];
    }
    const maybeFunction = node.elements[node.elements.length - 1];
    if (!ts.isArrowFunction(maybeFunction) && !ts.isFunctionExpression(maybeFunction)) {
        return [];
    }
    if (node.elements.slice(0, -1).some((element) => !ts.isStringLiteral(element))) {
        return [];
    }
    const headStart = node.getStart();
    const functionStart = maybeFunction.getStart();
    const headSpan = { start: headStart, length: functionStart - headStart };

    const parameterNames = getParameterNames(maybeFunction);
    if (!parameterNames.length) {
        return [
            { span: headSpan, newText: "" },
            { span: { start: maybeFunction.end, length: node.end - maybeFunction.end}, newText: "" },
        ];
    }
    const newText = getStringArrayLiteral(parameterNames).slice(0, -1) + ", ";
    return [
        { span: headSpan, newText },
    ];
}

function getEditsForFunction(node: ts.SignatureDeclarationBase): ts.TextChange[] {
    if (ts.isArrayLiteralExpression(node.parent)) {
        // TODO: fix annotation
        return [];
    }
    const parameterNames = getParameterNames(node);
    if (!parameterNames.length) {
        // TODO: fix annotation
        return [];
    }
    const headStart = node.getStart();
    const headText = getStringArrayLiteral(parameterNames).slice(0, -1) + ", ";
    const tailText = "]";
    return [
        { span: { start: headStart, length: 0 }, newText: headText },
        { span: { start: node.end, length: 0 }, newText: tailText },
    ];
}

function getEditsForConstructor(node: ts.ClassDeclaration): ts.TextChange[] {
    let injectNode: ts.PropertyDeclaration;
    let parameterNames: string[];
    for (const classElement of node.members) {
        if (ts.isPropertyDeclaration(classElement) && classElement.name.getText() === "$inject") {
            injectNode = classElement;
            continue;
        }
        if (ts.isConstructorDeclaration(classElement) && hasNgInjectPrologue(classElement.body)) {
            parameterNames = getParameterNames(classElement);
            continue;
        }
    }
    if (!parameterNames || !parameterNames.length) {
        // TODO: fix annotation
        return [];
    }
    if (injectNode) {
        // TODO: fix annotation
        return [];
    }
    // Insert just before the first class member.
    const start = node.members[0].getStart();
    const indentation = getIndentation(node.members[0]);
    const injectPropertyDeclaration = `static $inject = ${getStringArrayLiteral(parameterNames)};\n${indentation}`;
    return [
        { span: { start, length: 0 }, newText: injectPropertyDeclaration },
    ];
}

function getIndentation(node: ts.Node): string {
    const leadingTrivia = node.getSourceFile().text.slice(node.pos, node.getStart());
    const lastIndex = leadingTrivia.lastIndexOf("\n");
    if (lastIndex === -1) {
        return leadingTrivia;
    }
    return leadingTrivia.slice(lastIndex + 1);
}

function getStringArrayLiteral(strings: string[]): string {
    return "[" + strings.map((text) => `'${text}'`).join(", ") + "]";
}

function getParameterNames(node: ts.SignatureDeclarationBase): string[] {
    return node.parameters.map((parameter) => parameter.name.getText());
}

function isNgMethodCall(node: ts.Node): node is ts.CallExpression {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    if (!ts.isPropertyAccessExpression(node.expression)) {
        return false;
    }
    return isNgModuleMethodAccess(node.expression) ||
        node.expression.getText() === "$provide.decorator";
}

const ngModuleMethodNames = [
    "component", "config", "constant", "controller", "directive", "factory",
    "filter", "provider", "run", "service", "value", "decorator",
];

function isNgModuleMethodAccess(node: ts.PropertyAccessExpression): boolean {
    if (ngModuleMethodNames.indexOf(node.name.text) < 0) {
        return false;
    }
    if (node.expression.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callExpression = node.expression as ts.CallExpression;
    if (!ts.isPropertyAccessExpression(callExpression.expression)) {
        return false;
    }
    return callExpression.expression.getText() === "angular.module" ||
        isNgModuleMethodAccess(callExpression.expression);
}

function hasNgInjectPrologue(node: ts.Node): node is ts.Block {
    if (!ts.isBlock(node)) {
        return false;
    }
    if (!node.statements.length) {
        return false;
    }
    if (node.statements[0].kind !== ts.SyntaxKind.ExpressionStatement) {
        return false;
    }
    const expression = (node.statements[0] as ts.ExpressionStatement).expression;
    return ts.isStringLiteral(expression) && expression.text === "ngInject";
}
