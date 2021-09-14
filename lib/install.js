const { spawn } = require('child_process')

const install = function () {
	console.time('install time')
	const run = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'])
	run.stdout.on('data', (data) => {
		console.log(`${data}`)
	})

	run.stderr.on('data', (data) => {
		console.log(`${data}`)
	})

	run.on('close', (code) => {
		console.log(`child process exited with code ${code}`)
		console.timeEnd('install time')
	})
}

module.exports = {
	install
}