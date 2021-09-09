
const fs = require('fs-extra')
const inquirer = require('inquirer') // 实现交互式命令行
const download = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const mvdir = require('mvdir') // 迁移文件
const mv = require('mv')
const delDir = require('del') // 删除文件
const writeFileTree = require('./util/writeFileTree')
const getPkg = require('./util/getPkg')

const TEMPLATE_HOST = `direct:http://192.168.11.6:10080/BBSS/BbssTemplate.git#master`

const customChoices = [
    { name: 'H5通用模板', value: 1 },
    { name: 'PC通用模板', value: 2 },
    { name: '小程序通用模板', value: 3 }
]

const templateType = {
    h5: 'ks-h5-template',
    vant: 'ks-vant-template',
    pc: 'ks-pc-template',
    element: 'ks-element-template'
}

const askList = [
    {
        type: 'input',
        name: 'desc',
        message: '请输入你的项目描述'
    },
    {
        type: 'list',
        name: 'custom',
        message: '请选择你要创建的模板',
        choices: customChoices
    }
]

/**
 * 修改模板文件的参数
 * @param {String} projectName 项目名称
 * @param {Object} params 输入的参数
 */
async function writePkg(projectName, params) {
    let pkg = getPkg(projectName)
    pkg = Object.assign({}, pkg, params)
    // write package.json
    await writeFileTree(projectName, {
        'package.json': JSON.stringify(pkg, null, 2)
    })
}

async function startDownload(downLoadType, projectName, description) {
    // 在下载前提示
    const spinner = ora('正在创建项目...').start()
    const tempPath = `${projectName}/temp`
    download(TEMPLATE_HOST, tempPath, { clone: true }, async (err) => {
        if (err) {
            spinner.fail()
            console.log(logSymbols.error, chalk.red('项目创建失败，失败原因：' + err))
            return
        }
        await mvdir(`${projectName}/temp/${downLoadType}`, projectName, { copy: true })
        await mv(`${projectName}/temp/ks-tool/lib/kstool.js`, `${projectName}/src/assets/js/utils.js`, () => {
            console.log(logSymbols.info, chalk.green(`\n自动集成公共库,路径：${projectName}/src/assets/js/utils.js`))
        })
        await delDir([tempPath])
        await writePkg(projectName, {
            name: projectName,
            description: description
        })
        spinner.succeed()
        console.log(logSymbols.success, chalk.green('项目创建成功，建议执行'))
        console.log(logSymbols.info, `进入目录：${chalk.green('cd ' + projectName)}`)
        console.log(logSymbols.info, `安装依赖：${chalk.green('yarn install')}`)
    })
}

/**
 * 处理配置结果
 * @param {Object} answers 输入配置结果
 */
async function handleAnswers(answers) {
    const curSelect = customChoices.find(item => answers.custom === item.value)
    // 选择h5模板
    if (parseInt(curSelect.value) === 1) {
        const vantAnswers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isVant',
                message: '是否自动集成vant移动端组件库？'
            }
        ])
        let downLoadType = vantAnswers.isVant ? templateType.vant : templateType.h5
        startDownload(downLoadType, answers.name, answers.desc)
    } else if (parseInt(curSelect.value) === 2) {
        const eleAnswers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isEle',
                message: '是否自动集成elementUI组件库？'
            }
        ])
        let downLoadType = eleAnswers.isEle? templateType.element : templateType.pc
        startDownload(downLoadType, answers.name, answers.desc)
    } else {
        console.log(logSymbols.error, chalk.red('模板开发中，构建失败'))
    }
}

/**
 * 询问配置的内容
 * @param {String} projectName 项目名称
 */
async function askConfig(projectName) {
    const isExist = await fs.pathExists(projectName)
    if (isExist) {
        console.log(logSymbols.error, chalk.red('创建的项目已存在！'))
        return
    }
    const answers = await inquirer.prompt(askList)
    answers.name = projectName
    handleAnswers(answers)
}

async function init(projectName) {
    if (!projectName) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: '请输入你的项目名称'
            }
        ])
        if (!answers.name) {
            init('')
            return
        }
        askConfig(answers.name)
    } else {
        askConfig(projectName)
    }
}

module.exports = (...args) => {
    return init(...args).catch(err => {
        error(err)
        process.exit(1)
    })
}