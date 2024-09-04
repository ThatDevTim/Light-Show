const chalk = require("chalk")
const { SerialPort } = require('serialport')

const debug = require("./debugHandler")

function send(message) {
	const port = new SerialPort({
		path: '/dev/ttyS0',
		baudRate: 115200
	})

	port.on('open', () => {
		debug.note("Serial port opened")

		port.write(message + '\n', (err) => {
			if (err) return debug.failure(`Error on write: ${chalk.underline(err.message)}`)
			debug.success(`Serial port message sent: ${chalk.underline(message)}`)
		})

		port.drain(() => {
			port.close((err) => {
				if (err) return debug.failure(`Error closing port: ${chalk.underline(err.message)}`)
			})
		})
	})

	port.on('error', (err) => {
		return debug.failure(`Serial port error: ${chalk.underline(err.message)}`)
	})
}

module.exports = { send }