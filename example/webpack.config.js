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
        test: /noflo\/lib\/loader\/register.js$/,
        use: [
          {
            loader: 'noflo-component-loader',
            options: {},
          },
        ],
      },
    ]
  },
};
