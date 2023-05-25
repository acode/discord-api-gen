const childProcess = require('child_process');
const OUTPUT_ROOT = './output/service';

module.exports = async () => {

  await new Promise((resolve, reject) => {
    let child = childProcess.exec(
      'lib up beta',
      {
        cwd: OUTPUT_ROOT
      },
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
    child.stdout.on('data', (data) => process.stdout.write(data.toString()));
    child.stderr.on('data', (data) => process.stderr.write(data.toString()));
  });

  return true;

};
