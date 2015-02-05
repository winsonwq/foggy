var co = require('co');
var stub = require('../lib/stub');
var should = require('chai').should();

describe('stub', function() {

  describe('anonymous stub', function() {

    it('could create anonymous stub', function() {
      stub().constructor.name.should.eql('GeneratorFunction');
    });

    it('could stub generator to return 1', function(done) {
      var stubGen = stub().returns(1);
      co(stubGen).then(function(val) {
        val.should.eql(1);
        done();
      }).catch(done);
    });

    it('could stub generator to return empty string', function(done) {
      var stubGen = stub().returns('');
      co(stubGen).then(function(val) {
        val.should.eql('');
        done();
      }).catch(done);
    });

    it('could stub generator to return a specific object', function(done) {
      var returnValue = {};
      var stubGen = stub().returns(returnValue);
      co(stubGen).then(function(val) {
        val.should.equal(returnValue);
        val.should.not.equal({});
        done();
      }).catch(done);
    });

    it('could stub generator to throw exception', function(done) {
      var stubGen = stub().throws();
      co(stubGen).catch(function(err) { done(); });
    });

    it('could stub generator to throw a specific obj', function(done) {
      var customError = { error: 'custom error' };
      var stubGen = stub().throws(customError);

      co(stubGen).catch(function(err) {
        try {
          err.should.equal(customError);
          done();
        } catch(ex) {
          done(ex);
        }
      });
    });

    describe('stub with condition', function() {

      describe('call condition', function() {

        it('could stub first call to return a specific object', function(done) {
          var stubGen = stub().returns(1);
          var returnValue = {};
          stubGen.onFirstCall.returns(returnValue);

          co(stubGen).then(function(firstReturnValue) {
            firstReturnValue.should.equal(returnValue);
            stubGen.calledCount.should.equal(1);

            return co(stubGen).then(function(restReturnValue) {
              restReturnValue.should.equal(1);
              stubGen.calledCount.should.equal(2);
              done();
            });

          }).catch(done);

        });

        it('could stub second call to return a specific object', function(done) {
          var stubGen = stub().returns(1);
          var returnValue = {};
          stubGen.onSecondCall.returns(returnValue);

          co(stubGen).then(function(firstReturnValue) {
            firstReturnValue.should.equal(1);

            return co(stubGen).then(function(secondReturnValue) {
              secondReturnValue.should.equal(returnValue);

              return co(stubGen).then(function(thirdReturnValue) {
                thirdReturnValue.should.equal(1);
                done();
              });

            });
          }).catch(done);
        });

        it('could stub first call to throws specific object', function(done) {
          var stubGen = stub().returns(1);
          var throwsValue = {};
          stubGen.onFirstCall.throws(throwsValue);

          co(stubGen).catch(function(err) {
            try {
              err.should.equal(throwsValue);
              done();
            } catch (ex) {
              done(ex);
            }
          });
        });
      });

      describe('withArgs condition', function() {

        it('could stub on a call with args: 1, 2', function(done) {
          var stubGen = stub().returns(0);
          stubGen.withArgs(1, 2).returns(2);

          Promise.all([co.wrap(stubGen)(1, 2), co(stubGen)])
            .then(function(vals) {
              vals[0].should.eql(2);
              vals[1].should.eql(0);
              done();
            }).catch(done);
        });

        it('could stub on a call to throw 2', function(done) {
          var stubGen = stub().returns(0);
          stubGen.withArgs(1, 2).throws(2);

          co.wrap(stubGen)(1, 2).catch(function(err) {
            try {
              err.should.eql(2);
              done();
            } catch (ex) {
              done(ex);
            }
          });
        });

      });

    });
  });


  describe('stub on context generator', function() {

    it('could stub context.gen to return this', function(done) {
      var context = { gen: function* () { return 0; } };
      var stubGen = stub(context, 'gen').returnsThis();

      co(stubGen).then(function(val) {
        val.should.equal(context);
        done();
      }).catch(done);
    });

    it('could stub context.gen on first call to return this', function(done) {
      var context = { gen: function* () { return 0; } };
      stub(context, 'gen')
        .returns(1)
        .onFirstCall.returnsThis();

      co(context.gen).then(function(val) {
        val.should.equal(context);
        done();
      }).catch(done);
    });

    it('could stub context.gen to return 1', function(done) {
      var context = { gen: function* () { return 0; } };
      var stubGen = stub(context, 'gen').returns(1);

      stubGen.should.equal(context.gen);

      co(context.gen).then(function(val) {
        val.should.equal(1);
        done();
      }).catch(done);
    });

    it('could reset context.gen', function(done) {
      var context = { gen: function* () { return 0; } };
      var stubGen = stub(context, 'gen').returns(1);

      co(context.gen).then(function(val) {
        val.should.equal(1);
        context.gen.reset();

        return co(context.gen).then(function(resetValue) {
          resetValue.should.eql(0);
          done();
        });

      }).catch(done);
    });

    it('could stub context.gen to throw 1', function(done) {
      var context = { gen: function* () { return 0; } };
      var stubGen = stub(context, 'gen').throws(1);

      co(context.gen).catch(function(err) {
        try {
          err.should.equal(1);
          done();
        } catch(ex) {
          done(err);
        }
      });
    });

    describe('stub with another generator', function() {

      it('could stub context.gen with another generator which returns 1', function(done) {
        var context = { gen: function* () { return 0; } };
        var replaceGen = function* () { return 1; };
        var stubGen = stub(context, 'gen').calls(replaceGen);

        co(stubGen).then(function (val) {
          val.should.eql(1);
          done();
        }).catch(done);
      });

      it('could stub context.gen on second call with another generator with return 1', function(done) {
        var context = { gen: function* () { return -1; } };
        var replaceGen = function* () { return 1; };
        var stubGen = stub(context, 'gen').returns(0);

        stubGen.onSecondCall.calls(replaceGen);

        co(stubGen).then(function (val) {
          val.should.eql(0);

          return co(stubGen).then(function(secondReturnValue) {
            secondReturnValue.should.eql(1);

            return co(stubGen).then(function(thridReturnValue) {
              thridReturnValue.should.eql(0);
              done();
            });

          });

        }).catch(done);
      });

    });

  });


});
