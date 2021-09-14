#!/usr/bin/env node
const { program } = require('commander')
const packageInfo = require('../package.json');
console.log('欢迎使用micro多项目同时运行工具！')

program.version(packageInfo.version) //输出对应的版本号

program
  .command('init')
  .description('初始化项目基础配置')
  .action(function () {
    const { init } = require('../lib/init')
    init()
  })


program
  .command('install')
  .description('安装依赖')
  .action(function () {
    const { install } = require('../lib/install')
    install()
  })

program
  .command('serve')
  .description('安装依赖')
  .action(function () {
    const { serve } = require('../lib/serve')
    serve()
  })


program
  .command('help')
  .description('查看所有帮助')
  .action(function () {
    console.log(`暂无帮助`)
  })

program.parse(process.argv)