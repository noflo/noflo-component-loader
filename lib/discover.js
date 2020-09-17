const fbpManifest = require('fbp-manifest');

function loadManifest(options) {
  return new Promise((resolve, reject) => {
    fbpManifest.load.load(options.baseDir, options.manifest, (err, manifest) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(manifest);
    });
  });
}

function findGraphDependencies(manifestModules, options) {
  return new Promise((resolve, reject) => {
    fbpManifest.dependencies.find(manifestModules, options.graph, options, (err, filtered) => {
      if (err) {
        reject(err);
        return;
      }
      const nofloMain = manifestModules.filter((m) => m.name === '');
      resolve(filtered.concat(nofloMain));
    });
  });
}

function filterDependencies(manifestModules, options) {
  const compatibleModules = manifestModules.filter((m) => {
    if (options.runtimes.indexOf(m.runtime) === -1) {
      return false;
    }
    return true;
  });
  if (!options.graph) {
    // Return all compatible modules
    return Promise.resolve(compatibleModules);
  }
  return findGraphDependencies(compatibleModules, options);
}

function discoverModules(options) {
  return loadManifest(options)
    .then((manifest) => filterDependencies(manifest.modules, options));
}

module.exports = discoverModules;
