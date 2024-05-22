const { SerialPort } = require('serialport')

const port = new SerialPort({
  path: '/dev/ttyS0',
  baudRate: 115200
})

port.on('open', () => {
  console.log('Serial port opened.');
  port.write('Play\n', (err) => {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('Message written.');
  })

  port.drain(() => {
    port.close((err) => {
      if (err) {
        return console.log('Error closing port: ', err.message)
      }
      console.log('Serial port closed.')
    })
  })
})

port.on('error', (err) => {
  console.error('Serial port error:', err.message)
})
