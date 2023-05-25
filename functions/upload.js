const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const OUTPUT_ROOT = './output/discord';

module.exports = async (namespace = null, env = 'beta') => {

  let namespaces = [];

  if (namespace) {
    namespaces = [namespace];
  } else {
    namespaces = fs.readdirSync(OUTPUT_ROOT);
  }

  let promises = namespaces.map(namespace => {
    return new Promise((resolve, reject) => {
      let child = childProcess.exec(
        `lib up ${env}`,
        {
          cwd: path.join(OUTPUT_ROOT, namespace)
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
      child.stdout.on('data', (data) => process.stdout.write(`[${namespace}] ${data.toString()}`));
      child.stderr.on('data', (data) => process.stderr.write(`[${namespace}] ${data.toString()}`));
    });
  });

  await Promise.all(promises);

  return true;

};
