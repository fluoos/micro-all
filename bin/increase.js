#!/usr/bin/env node
const path = require('path')
const glob = require('glob')
const fs = require('fs')

const maxOldSpaceSize = process.env.LIMIT || 10240
const cwd = process.cwd() + path.sep

// 参数：[文件路径、 需要修改的字符串、修改后的字符串] (替换对应文件内字符串的公共函数)
function replaceStr(filePath, sourceRegx, targetSrt) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log('replaceStr', filePath)
      let str = data.toString()
      str = str.replace(sourceRegx, targetSrt)
      fs.writeFileSync(filePath, str)
    }
  })
}

function fixIncreaseMemory() {
  // 第一次运行项目时通过node执行此脚本
  const wfPath = path.resolve('./', './node_modules/.bin')
  fs.readdir(wfPath, (err, files) => {
    if (err) {
      console.log(err)
    } else {
      if (files.length != 0) {
        console.log('readdirSync', wfPath)
        files.forEach((item) => {
          if (item.split('.')[1] === 'cmd') {
            replaceStr(`${wfPath}/${item}`, /"%_prog%"/, '%_prog%')
          }
        })
      }
    }
  })
}

glob(path.join(cwd, "node_modules", ".bin", "*"), function (err, files) {

  files.forEach(file => {
    // readFileSync will crash on non-files. Skip over these
    let stat = fs.lstatSync(fs.realpathSync(file))
    if (!stat.isFile()) {
      return
    }
    if (file.indexOf('increase-memory-limit') >= 0) {
      return
    }
    // build scripts will hand in LIMIT via cross-env
    // avoid updating it while we are running it
    if (file.indexOf('cross-env') >= 0) {
      return
    }
    let contents = fs.readFileSync(file).toString()
    let lines = contents.split('\n')

    let patchedContents = ""

    for (var index = 0; index < lines.length; index++) {
      var line = lines[index]
      if (line.startsWith("if [") || line.startsWith("@IF") || line.indexOf('has_node') !== -1) {
        patchedContents += line + "\n"
      } else {
        patchedContents += line.replace(/node(\.exe)?\b(?: \-\-max\-old\-space\-size\=[0-9]+)?/, `node$1 --max-old-space-size=${maxOldSpaceSize}`) + "\n"
      }
    }

    fs.writeFileSync(file, patchedContents)
    console.log(`'${file.replace(cwd, "")}'`, "written successfully.")
  })
  setTimeout(() => {
    fixIncreaseMemory()
    console.log("written successfully.")
  }, 100)
})

