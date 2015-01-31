var co = require('co');
var should = require('chai').should();
var spy = require('../lib/spy');

describe('spy', function() {

  describe('proxy', function () {

    it('should return same value', function(done) {
      var gen = function* () { return Promise.resolve('test data'); };
      Promise.all([co(gen), co(spy(gen).proxy)]).then(function (vals) {
        vals[0].should.equal('test data');
        vals[0].should.equal(vals[1]);
        done();
      });
    });

  });

  it('should be called', function(done) {
    var gen = function* () { return 1; };
    var spyGen = spy(gen);
    co(spyGen.proxy)
      .then(function () {
        spyGen.called.should.be.true;
        done();
      }).catch(done);
  });

  it('should be called once', function(done) {
    var gen = function* () { return 1; };
    var spyGen = spy(gen);

    co(spyGen.proxy)
      .then(function () {
        spyGen.calledOnce.should.be.true;
        done();
      }).catch(done);
  });

  it('should be called twice', function(done) {
    var gen = function* () { return 1; };
    var spyGen = spy(gen);

    Promise.all([co(spyGen.proxy), co(spyGen.proxy)])
      .then(function () {
        spyGen.calledTwice.should.be.true;
        done();
      }).catch(done);
  });

  it('should be called thrice', function(done) {
    var gen = function* () { return 1; };
    var spyGen = spy(gen);

    Promise.all([co(spyGen.proxy), co(spyGen.proxy), co(spyGen.proxy)])
      .then(function () {
        spyGen.calledThrice.should.be.true;
        done();
      }).catch(done);
  });

  it('should be called with {} in firstCall', function (done) {
    var gen = function* (obj) { return obj; };
    var spyGen = spy(gen);
    var arg = {};

    co.wrap(spyGen.proxy)(arg)
      .then(function () {
        spyGen.firstCall.calledWith(arg).should.be.true;
        done();
      }).catch(done);
  });

  it('should be called with correct args in first and second call', function (done) {
    var gen = function* (obj) { return obj; };
    var spyGen = spy(gen);
    var firstCall = co.wrap(spyGen.proxy)({});
    var secondCall = co.wrap(spyGen.proxy)([]);

    Promise.all([firstCall, secondCall])
      .then(function () {
        spyGen.firstCall.calledWith({}).should.be.true;
        spyGen.secondCall.calledWith([]).should.be.true;
        done();
      }).catch(done);
  });

  it('should return {} when is called with {} in first call', function(done) {
    var gen = function* (obj) { return obj; };
    var spyGen = spy(gen);
    var firstCall = co.wrap(spyGen.proxy)({});

    firstCall
      .then(function () {
        spyGen.firstCall.returnValue.should.eql({});
        done();
      }).catch(done);

  });

  it('should called on a specific context', function (done) {
    var context = { gen: function* (obj) { return obj; } };
    var spyGen = spy(context, 'gen');

    co(spyGen.proxy).then(function () {
      spyGen.firstCall.thisValue.should.equal(context);
      done();
    }).catch(done);
  });

  it('could set proxy on context',function (done) {
    var context = { gen: function* (obj) { return obj; } };
    var sourceGen = context.gen;
    var spyGen = spy(context, 'gen');

    co(context.gen).then(function () {
      context.gen.toString().should.not.eql(sourceGen.toString());
      spyGen.reset();
      context.gen.toString().should.eql(sourceGen.toString());
      done();
    }).catch(done);
  });

  it('could reset spy calls', function (done) {
    var gen = function* (obj) { return obj; };
    var spyGen = spy(gen);
    var call = co.wrap(spyGen.proxy);

    call({}).then(function () {

      spyGen.calledCount.should.eql(1);
      spyGen.reset();
      spyGen.calledCount.should.eql(0);

      return call({})
        .then(function () {
          spyGen.calledCount.should.eql(1);
          done();
        });
    }).catch(done);
  });

});