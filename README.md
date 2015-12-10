# class-decorators
Provides mixin support through es2015 decorators

## Installation
```sh
npm i class-decorators -S
```
## Usage

```js
//myMixins.js
import request from 'request';

export const Readable = {
  get() {
    return request.get();
  },
  head() {
    return request.head();
  }
};

export const Writeable = {
  post() {
    return request.post();
  },
  put() {
    return request.put();
  },
  patch() {
    return request.patch;
  },
  delete() {
    return request.delete();
  }
};

// api.js
import {mixin, override} from 'class-decorators';
import {Readable, Writable} from './myMixins';

@mixin(Readable, Writable)
class Api {
  get() {
    return 'this will be overwritten by Readable.get';
  }
  
  @override
  post() {
    return 'this will not be overwritten due to @override';
  }
}
```