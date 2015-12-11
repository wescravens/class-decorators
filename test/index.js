/* globals before, after, describe, it, beforeEach */
'use strict';

// Dependencies
import {mixin, override, cascade} from '..';

let Readable = {
  get() {
    return 'get enabled';
  },
  head() {
    return 'head enabled';
  }
};

let Writeable = {
  post() {
    return 'post enabled';
  },
  put() {
    return 'put enabled';
  },
  patch() {
    return 'patch enabled';
  },
  delete() {
    return 'delete enabled';
  }
};

describe('@mixin', () => {
  it('should decorate class with mixins', () => {
    @mixin(Readable, Writeable)
    class Api {
      get() {
        return 'this will be overwritten by mixin';
      }
    }

    let api = new Api();

    api.get().should.be.equal('get enabled');
    api.head().should.be.equal('head enabled');
    api.post().should.be.equal('post enabled');
    api.put().should.be.equal('put enabled');
    api.patch().should.be.equal('patch enabled');
  });
});

describe('@override', () => {
  it('should preserve properties decorated with @override', () => {
    @mixin(Readable, Writeable)
    class Api {
      @override
      get() {
        return 'this will be preserved';
      }
    }

    let api = new Api();

    api.get().should.be.equal('this will be preserved');
    api.head().should.be.equal('head enabled');
    api.post().should.be.equal('post enabled');
    api.put().should.be.equal('put enabled');
    api.patch().should.be.equal('patch enabled');
  });
});

describe('@cascade', () => {
  it('should call mixin functions with same name in the order they were added', () => {
    const AnotherDelete = {delete() {return 'another delete'}};
    @mixin(Readable, Writeable, AnotherDelete)
    class Api {
      @cascade
      delete() {
        return 'this will be called after Writable.delete';
      }
    }

    let api = new Api();

    let deleteReturns = api.delete();

    deleteReturns[0].should.be.equal('delete enabled');
    deleteReturns[1].should.be.equal('another delete');
    deleteReturns[2].should.be.equal('this will be called after Writable.delete');
  });
});
