module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    path: __dirname,
    filename: 'example.bundle.js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        use: ['coffee-loader'],
      },
      {
        test: /\.fbp$/,
        use: ['fbp-loader'],
      },
      {
        // Replace NoFlo's dynamic loader with a generated one
        test: /noflo\/lib\/loader\/register.js$/,
        use: [
          {
            loader: 'noflo-component-loader',
            options: {
              // Only include components used by this graph
              // Set to NULL if you want all installed components
              graph: 'component-loader-example/InvertAsync',
              // Whether to include the original component sources
              // in the build
              debug: true,
            },
          },
        ],
      },
    ]
  },
};
