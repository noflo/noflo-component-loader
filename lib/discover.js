const fbpManifest = require('fbp-manifest');

function loadManifest(options) {
  return fbpManifest.load.load(options.baseDir, options.manifest);
}

function findGraphDependencies(manifestModules, options) {
  return fbpManifest.dependencies.find(manifestModules, options.graph, options)
    .then((filtered) => {
      const nofloMain = manifestModules.filter((m) => m.name === '');
      return filtered.concat(nofloMain);
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
