const { spawn } = require('child_process')

const serve = function () {
	console.time('serve time')
	const run = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run','serve'])
	run.stdout.on('data', (data) => {
		console.log(`${data}`)
	})

	run.stderr.on('data', (data) => {
		console.log(`${data}`)
	})

	run.on('close', (code) => {
		console.log(`child process exited with code ${code}`)
		console.timeEnd('serve time')
	})
}

module.exports = {
	serve
}