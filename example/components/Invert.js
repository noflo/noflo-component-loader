const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.inPorts.add('in', {
    datatype: 'boolean',
  });
  c.outPorts.add('out', {
    datatype: 'boolean',
  });
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const data = input.getData('in');
    if (data) {
      output.sendDone(false);
      return;
    }
    output.sendDone(true);
  });
  return c;
};
