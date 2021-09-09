#!/usr/bin/env node
const { program } = require('commander')
const packageInfo = require('../package.json');
console.log('欢迎使用ak-cli脚手架工具！')

program.version(packageInfo.version) //输出对应的版本号

program
    .command('create [project]')
    .description('初始化项目模板')
    .action(async (projectName) => {
        require('../lib/create')(projectName)
    })

program
    .command('help')
    .description('查看所有帮助')
    .action(function () {
        console.log(`暂无帮助`)
    })

program.parse(process.argv)