function registerCustomLoaders(loader, loaders, callback) {
  if (!loaders.length) {
    callback();
    return;
  }
  const customLoader = loaders.shift();
  loader.registerLoader(customLoader, (err) => {
    if (err) {
      callback(err);
      return;
    }
    registerCustomLoaders(loader, loaders, callback);
  });
}

function setSource(sources, loader, packageId, name, originalSource, language, callback) {
  let implementation;
  let source = originalSource;
  // Transpiling
  if (language === 'coffeescript') {
    if (typeof window !== 'undefined' && !window.CoffeeScript) {
      callback(new Error(`CoffeeScript compiler needed for ${packageId}/${name} not available`));
      return;
    }
    try {
      source = window.CoffeeScript.compile(source, {
        bare: true,
      });
    } catch (e) {
      callback(e);
      return;
    }
  }
  if (language === 'es6' || language === 'es2015') {
    if (typeof window !== 'undefined' && window.babel) {
      try {
        source = window.babel.transform(source).code;
      } catch (e) {
        callback(e);
        return;
      }
    }
  }
  // Eval the contents to get a runnable component
  try {
    const withExports = `(function () { var exports = {}; ${source}; return exports; })();`;
    // eslint-disable-next-line no-eval
    implementation = eval(withExports);
  } catch (e) {
    callback(e);
    return;
  }

  if (typeof implementation !== 'function' && (!implementation.getComponent || typeof implementation.getComponent !== 'function')) {
    callback(new Error(`Provided source for ${packageId}/${name} failed to create a runnable component`));
    return;
  }

  const fullName = `${packageId}/${name}`;
  // eslint-disable-next-line no-param-reassign
  sources[fullName] = {
    language,
    source: originalSource,
  };

  loader.registerComponent(packageId, name, implementation, callback);
}

function getSource(sources, loader, name, callback) {
  if (!loader.components[name]) {
    callback(new Error(`Component ${name} not available`));
    return;
  }
  const component = loader.components[name];
  let componentData;
  if (name.indexOf('/') !== -1) {
    const nameParts = name.split('/');
    componentData = {
      name: nameParts[1],
      library: nameParts[0],
    };
  } else {
    componentData = {
      name,
      library: '',
    };
  }
  if (loader.isGraph(component)) {
    componentData.code = JSON.stringify(component, null, 2);
    componentData.language = 'json';
    callback(null, componentData);
    return;
  } if (sources[name]) {
    componentData.code = sources[name].source;
    componentData.language = sources[name].language;
    componentData.tests = sources[name].tests;
    callback(null, componentData);
    return;
  } if (typeof component === 'function') {
    componentData.code = component.toString();
    componentData.language = 'javascript';
    callback(null, componentData);
    return;
  } if (typeof component.getComponent === 'function') {
    componentData.code = component.getComponent.toString();
    componentData.language = 'javascript';
    callback(null, componentData);
    return;
  }
  callback(new Error(`Unable to get sources for ${name}`));
}

function getLanguages() {
  const languages = ['javascript', 'es2015'];
  if (typeof window !== 'undefined' && window.CoffeeScript) {
    languages.push('coffeescript');
  }
  return languages;
}

module.exports = {
  registerCustomLoaders,
  setSource,
  getSource,
  getLanguages,
};
