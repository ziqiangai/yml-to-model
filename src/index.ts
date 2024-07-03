#!/usr/bin/env node
import * as fs from 'fs-extra';
import * as path from 'path';
import { Command } from 'commander';
const inquirer = require('inquirer');
import { renderTemplate } from './templateEngine'; // 假设有一个 renderTemplate 函数来处理模板渲染

const program = new Command();

/**
 * 解析项目名称，返回路径和文件名
 * @param {string} projectName 项目名称（例如 /path/to/user.yml）
 * @returns {object} 包含路径和文件名的对象 { path: string, fileName: string }
 */
export const parseProjectName = (projectName: string): { path: string, fileName: string } => {
    const parsedPath = path.parse(projectName);
    return {
        path: parsedPath.dir,
        fileName: parsedPath.base.split('.')[0]
    };
}

// 配置命令行选项
program
    .version('1.0.0')
    .command('gen <yml>').description('yml文件地址')
    .option('-l, --language <language>', '选择生成的代码语言，默认为 TypeScript')
    .option('-t, --template <templatePath>', '指定模板文件路径')
    .option('-o, --output <outputDir>', '指定输出文件夹路径')
    .action(async (yml, options) => {
        const { language, template, output } = options;

        // 如果未提供语言、模板或输出路径，通过询问用户获取
        const questions = [];
        if (!language) {
            questions.push({
                type: 'list',
                name: 'language',
                message: '请选择生成的代码语言',
                choices: ['TypeScript', 'Java'],
                default: 'TypeScript',
            });
        }
        if (!template) {
            questions.push({
                type: 'input',
                name: 'template',
                message: '请输入模板文件路径',
                default: 'default',
            });
        }
        if (!output) {
            questions.push({
                type: 'input',
                name: 'output',
                message: '请输入输出文件夹路径',
                default: './output',
            });
        }

        // 使用 inquirer 进行用户交互
        const answers = await inquirer.prompt(questions);
        console.log('zzq see answers', answers);
        const {language: selectedLanguage, template: templatePath, output: outputPath} = answers;
        const ymlMeta = parseProjectName(yml);
        // 使用模板引擎渲染模板并生成文件
        const l = language || selectedLanguage;
        const generatedCode = renderTemplate(
            l.toLowerCase() !== 'java',
            ymlMeta.path, ymlMeta.fileName,
            l,
            template || templatePath
        );
        const out = output || outputPath;
        fs.ensureDirSync(out);
        generatedCode.forEach((file) => {
            fs.writeFileSync(path.join(out, file.fileName), file.content);
        });
        // 确保输出目录存在，然后写入生成的文件

        console.log(`生成成功！`);
    });

// 解析命令行参数
program.parse(process.argv);
