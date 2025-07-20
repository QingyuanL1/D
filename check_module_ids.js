const fs = require('fs');
const path = require('path');

// 读取 MODULE_IDS 定义
const helperFile = fs.readFileSync('src/utils/formSubmissionHelper.ts', 'utf8');
const moduleIdsMatch = helperFile.match(/export const MODULE_IDS = \{([\s\S]*?)\}/);
if (!moduleIdsMatch) {
    console.error('无法找到 MODULE_IDS 定义');
    process.exit(1);
}

// 提取所有定义的模块ID
const moduleIdsContent = moduleIdsMatch[1];
const definedIds = new Set();
const lines = moduleIdsContent.split('\n');
for (const line of lines) {
    const match = line.match(/^\s*([A-Z_]+):\s*\d+/);
    if (match) {
        definedIds.add(match[1]);
    }
}

console.log('已定义的模块ID数量:', definedIds.size);
console.log('已定义的模块ID:', Array.from(definedIds).sort());

// 查找所有使用 MODULE_IDS 的文件
function findFiles(dir, extensions) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findFiles(fullPath, extensions));
        } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

const files = findFiles('src', ['.vue', '.ts', '.js']);
const usedIds = new Set();
const undefinedIds = new Set();
const fileUsages = {};

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/MODULE_IDS\.([A-Z_]+)/g);
    
    if (matches) {
        fileUsages[file] = [];
        for (const match of matches) {
            const id = match.replace('MODULE_IDS.', '');
            usedIds.add(id);
            fileUsages[file].push(id);
            
            if (!definedIds.has(id)) {
                undefinedIds.add(id);
            }
        }
    }
}

console.log('\n使用的模块ID数量:', usedIds.size);
console.log('使用的模块ID:', Array.from(usedIds).sort());

if (undefinedIds.size > 0) {
    console.log('\n❌ 发现未定义的模块ID:');
    for (const id of undefinedIds) {
        console.log(`  - ${id}`);
        console.log('    使用位置:');
        for (const [file, ids] of Object.entries(fileUsages)) {
            if (ids.includes(id)) {
                console.log(`      ${file}`);
            }
        }
    }
} else {
    console.log('\n✅ 所有使用的模块ID都已正确定义');
}

// 查找未使用的模块ID
const unusedIds = new Set();
for (const id of definedIds) {
    if (!usedIds.has(id)) {
        unusedIds.add(id);
    }
}

if (unusedIds.size > 0) {
    console.log('\n⚠️  未使用的模块ID:');
    for (const id of unusedIds) {
        console.log(`  - ${id}`);
    }
}
