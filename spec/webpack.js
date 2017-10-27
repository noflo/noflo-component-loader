const { exec } = require('child_process');
const { expect } = require('chai');
const path = require('path');

describe('Webpack build of example project', () => {
  const examplePath = path.resolve(__dirname, '../example');
  const projectPath = path.resolve(__dirname, '../');
  const projectModulePath = path.join(examplePath, './node_modules');
  const projectTargetPath = path.join(examplePath, './node_modules/noflo-component-loader/');
  let bundle = null;
  before(function (done) {
    this.timeout(60000);
    exec(`ln -s ${path.join(projectPath, './node_modules')} ${projectModulePath}`, {}, (err) => {
      if (err) return done(err);
      exec(`mkdir -p ${projectTargetPath}`, {}, (err) => {
        if (err) return done(err);
        exec(`cp ${projectPath}/index.js ${projectTargetPath}`, {}, (err) => {
          if (err) return done(err);
          exec(`cp -R ${projectPath}/lib ${projectTargetPath}/lib`, {}, done);
        });
      });
    });
  });
  after(function (done) {
    exec(`rm -r ${projectModulePath}/noflo-component-loader`, {}, (err) => {
      if (err) return done(err);
      exec(`rm ${projectModulePath}`, {}, done);
    });
  });
  it('should be possible to build', (done) => {
    exec('npm run build', {
      cwd: examplePath,
    }, done);
  }).timeout(60000);
  it('should produce a loadable module', () => {
    bundle = require('../example/example.bundle.js');
  });
  it('should produce working NoFlo', (done) => {
    const wrapped = bundle.asCallback('component-loader-example/InvertAsync');
    wrapped(true, (err, res) => {
      if (err) return done(err);
      expect(res).to.equal(false);
      done();
    });
  });
  it('should have core/RepeatAsync available', (done) => {
    const loader = new bundle.ComponentLoader();
    loader.load('core/RepeatAsync', (err, inst) => {
      if (err) return done(err);
      expect(inst).to.be.an('object');
      done();
    });
  });
  it('should not have core/Repeat available', (done) => {
    const loader = new bundle.ComponentLoader();
    loader.load('core/Repeat', (err, inst) => {
      expect(err).to.be.an('error');
      done();
    });
  });
});
