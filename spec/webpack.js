const { exec } = require('child_process');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

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
  it('should return original sources with getSource', (done) => {
    const sourcePath = path.resolve(__dirname, '../node_modules/noflo-core/components/RepeatAsync.coffee');
    const loader = new bundle.ComponentLoader();
    fs.readFile(sourcePath, 'utf-8', (err, original) => {
      if (err) return done(err);
      loader.getSource('core/RepeatAsync', (err, loaded) => {
        if (err) return done(err);
        expect(loaded.language).to.equal('coffeescript');
        expect(loaded.code).to.equal(original);
        done();
      });
    });
  });
  describe('setting sources', () => {
    let loader = null;
    before(() => {
      loader = new bundle.ComponentLoader();
    });
    describe('with a working component', () => {
      const source = `
  const noflo = require('noflo');
  exports.getComponent = () => {
    const c = new noflo.Component();
    c.inPorts.add('in');
    c.outPorts.add('out');
    c.process((input, output) => {
      output.sendDone(input.getData() + 2);
    });
    return c;
  };`
      it('should be able to write sources for elementary component', (done) => {
        loader.setSource('bar', 'Plusser', source, 'javascript', done);
      });
      it('should produce a runnable component', (done) => {
        loader.load('bar/Plusser', function (err, c) {
          if (err) return done(err);
          const ins = bundle.internalSocket.createSocket();
          const out = bundle.internalSocket.createSocket();
          c.inPorts.in.attach(ins);
          c.outPorts.out.attach(out);
          out.on('data', function (data) {
            expect(data).to.equal(3);
            c.outPorts.out.detach(out);
            done();
          });
          ins.send(1);
        });
      });
      it('should be able to read sources for the registered component', (done) => {
        loader.getSource('bar/Plusser', function (err, c) {
          if (err) return done(err);
          expect(c.library).to.equal('bar');
          expect(c.name).to.equal('Plusser');
          expect(c.language).to.equal('javascript');
          expect(c.code).to.equal(source);
          done();
        });
      });
    });
    describe('with a component with faulty requires', () => {
      const source = `
  const noflo = require('noflo');
  const foo = require('./not-existing');
  exports.getComponent = () => {
    const c = new noflo.Component();
    c.inPorts.add('in');
    c.outPorts.add('out');
    c.process((input, output) => {
      output.sendDone(input.getData() + 2);
    });
    return c;
  };`
      it('should be not able to write sources for elementary component', (done) => {
        loader.setSource('bar', 'FailRequire', source, 'javascript', (err) => {
          expect(err).to.be.an('error');
          done();
        });
      });
      it('should not produce a runnable component', (done) => {
        loader.load('bar/FailRequire', function (err, c) {
          expect(err).to.be.an('error');
          done();
        });
      });
      it('should be not able to read sources for the registered component', (done) => {
        loader.getSource('bar/FailRequire', function (err, c) {
          expect(err).to.be.an('error');
          done();
        });
      });
    });
    describe('with a component that doesn\'t export itself', () => {
      const source = `
  const noflo = require('noflo');
  const getComponent = () => {
    const c = new noflo.Component();
    c.inPorts.add('in');
    c.outPorts.add('out');
    c.process((input, output) => {
      output.sendDone(input.getData() + 2);
    });
    return c;
  };`
      it('should be not able to write sources for elementary component', (done) => {
        loader.setSource('bar', 'FailExport', source, 'javascript', (err) => {
          expect(err).to.be.an('error');
          expect(err.message).to.contain('failed to create a runnable component');
          done();
        });
      });
      it('should not produce a runnable component', (done) => {
        loader.load('bar/FailExport', function (err, c) {
          expect(err).to.be.an('error');
          done();
        });
      });
      it('should be not able to read sources for the registered component', (done) => {
        loader.getSource('bar/FailExport', function (err, c) {
          expect(err).to.be.an('error');
          done();
        });
      });
    });
  });
});
