/* globals before, after, describe, it, beforeEach */
'use strict';

// Dependencies
import {mixin, override, cascade} from '../index';

let Readable = {
  httpGet() {
    return 'Readable.get';
  },
  head() {
    return 'Readable.head';
  },
  opts: {
    host: 'Readable.opts.host',
    port: 'Readable.opts.port'
  }
};

let Writeable = {
  post() {
    return 'Writeable.post';
  },
  put() {
    return 'Writeable.put';
  },
  patch() {
    return 'Writeable.patch';
  },
  delete() {
    return 'Writeable.delete';
  }
};

describe('@mixin', () => {
  it('should decorate class with mixins', () => {
    @mixin(Readable, Writeable)
    class Api {
      httpGet() {
        return 'this will be overwritten by mixin';
      }
    }

    let api = new Api();

    api.httpGet().should.be.equal('Readable.get');
    api.head().should.be.equal('Readable.head');
    api.post().should.be.equal('Writeable.post');
    api.put().should.be.equal('Writeable.put');
    api.patch().should.be.equal('Writeable.patch');
  });

  it('should preserve non-conflicting class methods', () => {
    @mixin(Readable, Writeable)
    class Api {
      httpGet() {
        return 'this will be overwritten by mixin';
      }

      myMethod() {
        return 'myMethod';
      }
    }

    let api = new Api();

    api.myMethod().should.be.equal('myMethod');
  });
});

describe('@override', () => {
  it('should preserve properties decorated with @override', () => {
    @mixin(Readable, Writeable)
    class Api {
      @override
      httpGet() {
        return 'Api.get';
      }
    }

    let api = new Api();

    api.httpGet().should.be.equal('Api.get');
    api.head().should.be.equal('Readable.head');
    api.post().should.be.equal('Writeable.post');
    api.put().should.be.equal('Writeable.put');
    api.patch().should.be.equal('Writeable.patch');
  });
});

describe('@cascade', () => {
  it('should call mixin functions with same name in the order they were added', () => {
    const AnotherDelete = {delete() {return 'AnotherDelete.delete'}};
    @mixin(Readable, Writeable, AnotherDelete)
    class Api {
      @cascade
      delete() {
        return 'Api.delete';
      }
    }

    let api = new Api();

    let deleteReturns = api.delete();

    deleteReturns[0].should.be.equal('Writeable.delete');
    deleteReturns[1].should.be.equal('AnotherDelete.delete');
    deleteReturns[2].should.be.equal('Api.delete');
  });
});
