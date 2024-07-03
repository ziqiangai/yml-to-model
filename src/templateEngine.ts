import handlebars from 'handlebars';
import fs from 'fs';
import yaml from 'js-yaml';
import path from "path";

export interface RenderedFile {
    fileName: string,
    content: string;
}

handlebars.registerHelper('getJavaType', getJavaType);
handlebars.registerHelper('getTsType', getTsType);



// 默认的 TypeScript 接口模板
const defaultTypeScriptTemplate = `
{{#each models}}

/**
 * {{this.title}}
 * 
 * {{this.description}}
 */
export interface {{this.modelName}} {
{{#each this.properties}}

    /**
     * {{@key}}: {{this.description}}
     */
    {{@key}}: {{getTsType this}};
{{/each}}
}
{{/each}}
`;

// 默认的 Java 类模板
const defaultJavaTemplate = `

import java.util.*;

/**
 * {{this.title}}
 * 
 * {{this.description}}
 */
public class {{modelName}} {

{{#each this.properties}}

     {{#if this.description}}
    /**
     * {{this.description}}
     */
    {{/if}} 
    public {{{getJavaType this}}} {{@key}};
{{/each}}
}
`;


/**
 * 从 YAML 文件中加载模型数据
 * @param {string} yamlFilePath YAML 文件路径
 * @returns {object} 加载的模型数据
 */
export const loadModelsFromYaml = (ymlFilePath: string, projectName: string): Record<string, any> => {

    // 读取并解析 YAML 文件
    const yamlFilePath = path.resolve(ymlFilePath, `${projectName}.yml`);
    const yamlData = fs.readFileSync(yamlFilePath, 'utf8');
    const load = yaml.load(yamlData) as any;
    console.log('zzq see yml is', load);
    const modelDefinitions = load.components.schemas;
    return modelDefinitions;
};

/**
 * 使用 Handlebars.js 渲染模板
 * @param {string} templatePath 模板文件路径（可选）
 * @param {object} data 渲染模板所需的数据
 * @param {string} language 生成代码的目标语言（'typescript' 或 'java'）
 * @returns {string[]} 渲染后的字符串数组，每个元素对应一个文件内容
 */
export const renderTemplate = (inOneFile: boolean, ymlPath: string, ymlName: string, language: string, templatePath?: string)
    : RenderedFile[] => {

    const data = loadModelsFromYaml(ymlPath, ymlName);
    let templates: Record<string, string>;
    if (templatePath && templatePath !== 'default') {
        // 从模板文件加载模板内容
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        templates = {templateContent: ymlName + '.ts'};
    } else {
        // 根据语言选择模板内容
        switch (language.toLowerCase()) {
            case 'typescript':
                templates = {
                    [defaultTypeScriptTemplate]: ymlName + '.ts',
                };
                break;
            case 'java':
                templates = {
                    [defaultJavaTemplate]: '{{@key}}.java'
                };
                break;
            default:
                throw new Error(`Unsupported language: ${language}.`);
        }
    }

    const renderedFiles: RenderedFile[] = [];

    // 编译并渲染每个模板
    for (const templateContent in templates) {
        if (templates.hasOwnProperty(templateContent)) {
            const templateName = templates[templateContent];
            const template = handlebars.compile(templateContent);
            console.log('zzq see data', templateContent);
            if (!inOneFile) {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        console.log('set', {...data[key], key});
                        const renderedTemplate = template({...data[key], key, modelName: key});
                        console.log('xxx', renderedTemplate);
                        // 根据语言确定文件名后缀
                        const fileName = templateName.replace('{{@key}}', key);
                        renderedFiles.push({fileName, content: renderedTemplate});
                    }
                }
            }else {
                const models: { models: any[];} = {models: []}
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const item = {...data[key], key, modelName: key};
                        models.models.push(item);
                    }
                }
                const renderedTemplate = template(models);
                // 根据语言确定文件名后缀
                const fileName = templateName.replace('{{@key}}', ymlName);
                renderedFiles.push({fileName, content: renderedTemplate});
            }
        }
    }

    // 将结果返回
    return renderedFiles;
};

/**
 * 根据数据类型获取 Java 类型
 * @param value 值
 * @returns {string} 类型字符串
 */
function getJavaType(value: any): string {
    console.log('sd', value);
    let { type, items, $ref } = value;
    if (type === undefined && $ref !== undefined) {
        type = 'object';
    }
    switch (type) {
        case 'string':
            return 'String';
        case 'number':
        case 'integer':
            return 'Long';
        case 'boolean':
            return 'Boolean';
        case 'array':
            if (items) {
                // 处理数组类型
                if (items.type) {
                    return `List<${getJavaType(items)}>`;
                }else if (items.$ref) {
                    return `List<${items.$ref.split('/').pop()}>`;
                }
                return `List<Object>`;
            }
            return 'List<Object>'; // 默认情况下的数组类型处理
        case 'object':
            if ($ref) {
                return $ref.split('/').pop();
            }
            return 'Object';
        default:
            return 'Object';
    }
}
/**
 * 根据数据类型获取 TypeScript 类型
 * @param value 值
 * @returns {string} 类型字符串
 */
function getTsType(value: any): string {
    console.log('sd', value);
    let { type, items, $ref } = value;
    if (type === undefined && $ref !== undefined) {
        type = 'object';
    }
    switch (type) {
        case 'string':
            return 'string';
        case 'number':
        case 'integer':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'array':
            if (items) {

                if (items.type) {
                    return `${getTsType(items)}[]`;
                }else if (items.$ref) {
                    return `${items.$ref.split('/').pop()}[]`;
                }
                return `any[]`;
            }
            return 'any[]'; // 默认情况下的数组类型处理
        case 'object':
            if ($ref) {
                return $ref.split('/').pop();
            }
            return 'any';
        default:
            return 'any';
    }
}
