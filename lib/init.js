
const fs = require('fs-extra')
const inquirer = require('inquirer') // 实现交互式命令行
const ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const mvdir = require('mvdir') // 迁移文件
const mv = require('mv')
const delDir = require('del') // 删除文件
const writeFileTree = require('./util/writeFileTree')
const getPkg = require('./util/getPkg')
const path = require('path')

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
	return new Promise((resolve, reject) => {
		//根据文件路径读取文件，返回文件列表
		const dirArr = []
		fs.readdir(filePath, function (err, files) {
			if (err) {
				console.warn(err, "读取文件夹错误！")
				resolve(dirArr)
			} else {
				//遍历读取到的文件列表
				files.forEach((filename) => {
					//获取当前文件的绝对路径
					const filedir = path.join(filePath, filename)
					//根据文件路径获取文件信息，返回一个fs.Stats对象
					const statObj = fs.statSync(filedir)
					const isFile = statObj.isFile() //是文件
					const isDir = statObj.isDirectory() //是文件夹
					if (isFile) {
						// 文件先不处理
					}
					if (isDir && !filename.includes('.')) {
						// fileDisplay(filedir) //暂不递归，如果是文件夹，就继续遍历该文件夹下面的文件
						dirArr.push(filename)
					}
				})
				resolve(dirArr)
			}
		})
	})
}

async function getTemplate() {
	const curPath = __dirname.replace('lib', '') + 'templates/'
	console.log('current cwd path in ', curPath)
	return await getPkg(curPath)
}

/**
 * 开始初始化项目配置
 * @param {String} prefix 项目模糊名称
 */
async function startInit(prefix, isYarn) {
	const spinner = ora(`正在初始化${prefix}...`).start()
	// 当前文件目录路径
	const filePath = path.resolve('./')
	console.log('current path in', filePath)
	try {
		let nameArr = await	fileDisplay(filePath)
		if (prefix) {
			nameArr = nameArr.filter(path => path.includes(prefix))
		}
		const tempPack = await getTemplate()
		nameArr.forEach(item => {
			tempPack.scripts[`install:${item}`] = `cd ./${item} && ${isYarn ? 'yarn' : 'npm'} install`
			tempPack.scripts[`start:${item}`] = `cd ./${item} && ${isYarn ? 'yarn' : 'npm run'} serve`
		})
		await writeFileTree(filePath, {
			'package.json': JSON.stringify(tempPack, null, 2)
		})
		spinner.succeed()
		console.log(logSymbols.success, chalk.green('项目初始化成功，建议执行'))
		console.log(logSymbols.info, `当前目录：${chalk.green('npm install / yarn install')}`)
		console.log(logSymbols.info, `安装依赖：${chalk.green('npm run serve / yarn serve')}`)
	} catch (error) {
		spinner.stop()
		console.log(error)
		console.log(logSymbols.info, `初始化失败，${chalk.green('请重试')}`)
	}
}

const init = async function () {
	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'prefix',
			message: '输入模糊前缀匹配项目名称？'
		},
		{
			type: 'confirm',
			name: 'isYarn',
			message: '是否使用yarn命令？'
		}
	])
	startInit(answers.prefix, answers.isYarn)
}

module.exports = {
	init
}