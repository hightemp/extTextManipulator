const fs = require('fs');

// Rather than bring in the 'async' module for something this simple ...
function sequence(funcs, callback) {
  funcs.pop()(err => {
    if (err) {
      callback(err);
    } else if (!funcs.length) {
      callback(null);
    } else {
      sequence(funcs, callback);
    }
  });
}

/**
 * Makes rotating [file].0, [file].1 ... backups in the same directory
 * @return {Promise} Resolves on success, rejects on some fs-level error
 * @param {string} file - The path to the file to back up
 * @param {number} levels - The number of backups to keep
 * @param {function} [callback] - Standard error-first, if that's how you roll
 */
function file_backup(file, levels, callback) {

  const funcs = [];

  for (let n = levels - 1; n >= 0; n--) {
    funcs.push(cb => {
      const cfn = `${file}.${n}`;
      fs.stat(cfn, err => {
        if (err) {
          cb(err.errno == -2 ? null : err);
        } else if (n == levels - 1) {
          fs.unlink(cfn, err => cb(err ? err : null));
        } else {
          fs.copyFile(cfn, `${file}.${n + 1}`, err => cb(err ? err : null));
        }
      });
    });
  }

  funcs.push(cb => {
    fs.stat(file, err => {
      err ? cb(err) : fs.copyFile(file, `${file}.0`, e => cb(e ? e : null));
    });
  });

  const p = new Promise((res, rej) => {
    sequence(funcs, err => err ? rej(err) : res(null));
  });
  if (typeof callback == 'function') p.then(callback).catch(callback);
  return p;

}

export default file_backup;