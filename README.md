NoFlo Component Loader generator [![Build Status](https://travis-ci.org/noflo/noflo-component-loader.svg?branch=master)](https://travis-ci.org/noflo/noflo-component-loader) [![Greenkeeper badge](https://badges.greenkeeper.io/noflo/noflo-component-loader.svg)](https://greenkeeper.io/)
================================

This utility can be used for generating statically configured NoFlo component loaders when building NoFlo with a module bundler like [WebPack](https://webpack.js.org/).

## Usage

Install this library as a development dependency:

```bash
$ npm install noflo-component-loader --save-dev
```

Then configure WebPack to replace NoFlo's dynamic component loader with a generated one. Add to your `module.rules`:

```javascript
{
  // Replace NoFlo's dynamic loader with a generated one
  test: /noflo\/lib\/loader\/register.js$/,
  use: [
    {
      loader: 'noflo-component-loader',
      options: {
        // Only include components used by this graph
        // Set to NULL if you want all installed components
        graph: 'myproject/GraphName',
        // Whether to include the original component sources
        // in the build
        debug: false,
      },
    },
  ],
},
```

For a more complete example, see the `example/` folder.
