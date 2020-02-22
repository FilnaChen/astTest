const babel = require('@babel/core');
const generator = require('@babel/generator');
const path = require('path');
const fs = require('fs-extra');

const codePath = path.resolve(__dirname, './src');
const distPath = path.resolve(__dirname, './dist');

const traversePath = (codePath, distPath) => {
    if (fs.existsSync(distPath)) {
        fs.emptyDirSync(distPath);
    } else {
        fs.mkdirSync(distPath);
    }
   const files =  fs.readdirSync(codePath);
    if (Array.isArray(files)) {
        files.forEach((item) => {
            const filePath = path.resolve(__dirname, codePath, `${item}`);
            if (fs.statSync(filePath).isDirectory()) {
                traversePath(filePath, path.resolve(distPath, item));
            } else {
                const code = fs.readFileSync(filePath, 'utf-8');
                const generateCode = compressCode(code);
                const distFile = path.resolve(distPath, item);
                fs.writeFile(distFile, generateCode, (err) => {});
            }
        })
    }
};

const compressCode = (code) => {
    const ast = babel.parse(code, {
        plugins: [
            '@babel/plugin-syntax-dynamic-import'
        ]
    });
    if (ast.comments) {
        delete ast.comments;
    }
    if (ast.program.body) {
        if (Array.isArray(ast.program.body)) {
            ast.program.body.forEach((item) => {
                delete item.leadingComments;
            })
        }
    }
    return generator.default(ast).code;
};

traversePath(codePath, distPath);

const code = `
    import React from 'react';
    console.log(React);
`;

const ast = babel.parse(code, {
    plugins: [
        '@babel/plugin-syntax-dynamic-import'
    ]
});

ast.program.body[0].source.value = 'vue';

const res = generator.default(ast);



