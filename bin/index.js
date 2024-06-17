#! /usr/bin/env node
const { 
  init,
  generate,
  update,
  regenerate,
} = require('../lib/main.js');
const { 
  help,
  unknown,
  commands,
} = require('../lib/helpers.js');

(function main() {
  if (process.argv[2] == "-h" || process.argv[2] == "--help" || process.argv.length > 4) {
    help();
  } else if (process.argv.length > 2) {
    const cmd = process.argv.slice(2);

    if (!commands.includes(cmd[0])) {
      unknown(cmd[0]);
      process.exit(1);
    }

    cmd[0] = cmd[0].substring(0,2)

    switch(cmd[0]) {
      case 'in':
        init(cmd[1]);
        break;
      case 'ge':
        generate(cmd[1]);
        break;
      case 'up':
        update(cmd[1]);
        break;
      case 're':
        regenerate(cmd[1]);
        break;
    }
  } else {
    help();
  }
})();