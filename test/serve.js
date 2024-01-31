const fs = require('fs')
const httpServer = require('http-server')
const os = require('os')
const path = require('path')
const { program } = require('commander')
const { spawn } = require('child_process')

program.requiredOption('--browser_path <path>', 'Path to Browser executable')
program.allowUnknownOption(true)
program.parse(process.argv)

function createAndStartServer () {
  if (!fs.existsSync('key.pem') || !fs.existsSync('cert.pem')) {
    console.error(
      "Error: key.pem or cert.pem not found. Please install mkcert and run 'npm run mkcert' to generate the required files. " +
      'Follow https://github.com/FiloSottile/mkcert#installation for mkcert installation instructions.'
    )
    process.exit(1)
  }

  const server = httpServer.createServer({
    root: './',
    https: {
      key: 'key.pem',
      cert: 'cert.pem'
    }
  })

  return new Promise((resolve) => {
    server.listen(() => {
      resolve(server)
    })
  })
}

async function launchBrowser (executablePath, port) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'browser-profile-'))
  const args = [
    `--user-data-dir=${tempDir}`,
    `--host-resolver-rules=MAP *.bravesoftware.com:443 127.0.0.1:${port}, MAP *.brave.software:443 127.0.0.1:${port}`,
    'https://dev-pages.bravesoftware.com', // Add the URL to open in Browser
    ...program.args
  ]

  const browserProcess = spawn(executablePath, args, {
    stdio: 'inherit'
  })

  // Wait for the Browser process to exit
  await new Promise((resolve) => {
    browserProcess.on('exit', () => {
      resolve()
    })
  })

  fs.rmSync(tempDir, { recursive: true, force: true })
}

async function main () {
  const server = await createAndStartServer()
  await launchBrowser(
    program.opts().browser_path,
    server.server.address().port
  )
  server.server.close()
}

main()
