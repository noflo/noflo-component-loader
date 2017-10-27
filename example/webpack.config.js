module.exports = {
  target: 'node',
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'example.bundle.js',
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
