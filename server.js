const fs = require('fs');
const path = require('path');

const OSC = require('osc-js');
const chalk = require('chalk');
const express = require('express');
const ip = require('ip');

const pkg = require('./package.json');

class Server {
  constructor(options) {
    this.options = options;

    this.osc = new OSC({
      plugin: new OSC.BridgePlugin(this.options),
    });

    this.osc.on('error', error => {
      console.error(`${chalk.red('✘')} osc error: ${error.message}`);
    });

    this.osc.on('open', () => {
      console.log(`${chalk.green('✔')} osc bridge ready`, this.osc);
    });

    this.httpServer = undefined;
  }

  start() {
    this.osc.open();
  }

  startHttp() {
    const { port, host } = this.options.httpServer;
    const staticPath = path.resolve(__dirname, this.options.staticFolderName);

    this.httpServer = express();

    fs.access(staticPath, err => {
      if (!err) {
        console.log(`${chalk.green('✔')} static folder found`);
      } else {
        console.log(`${chalk.red('✘')} static folder not found`);
      }
    });

    this.httpServer.use(express.static(staticPath));

    this.httpServer.listen(port, host, () => {
      console.log(`${chalk.green('✔')} http server ready`);
    });
  }

  stop() {
    this.osc.close();
  }

  hello() {
    const ipAddress = ip.address();
    const { options } = this;

    // Clear terminal
    process.stdout.write('\x1Bc');

    // Say hello!
    console.log(chalk.bold.blue(pkg.name));
    console.log('- - - - - - - - - - - - - - - - - - - - -');
    console.log(`version: ${chalk.green(pkg.version)}`);
    console.log(`ip: ${chalk.green(ipAddress)}`);
    console.log('- - - - - - - - - - - - - - - - - - - - -');

    if (this.httpServer) {
      console.log(chalk.bold('http'));
      console.log('  server');
      console.log(`    host: ${chalk.green(options.httpServer.host)}`);
      console.log(`    port: ${chalk.green(options.httpServer.port)}`);
    }

    console.log(chalk.bold('udp'));
    console.log('  client');
    console.log(`    host: ${chalk.green(options.udpClient.host)}`);
    console.log(`    port: ${chalk.green(options.udpClient.port)}`);
    console.log('  server');
    console.log(`    host: ${chalk.green(options.udpServer.host)}`);
    console.log(`    port: ${chalk.green(options.udpServer.port)}`);
    console.log(chalk.bold('websocket'));
    console.log('  server');
    console.log(`    host: ${chalk.green(options.wsServer.host)}`);
    console.log(`    port: ${chalk.green(options.wsServer.port)}`);
    console.log('- - - - - - - - - - - - - - - - - - - - -');
  }
}

function startStaticServer() {
  const options = require('./options');
  const server = new Server(options);

  server.start();
  server.startHttp();

  server.hello();
}

if (require.main === module) {
  startStaticServer();
}

module.exports = Server;
