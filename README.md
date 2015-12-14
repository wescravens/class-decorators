# class-decorators
Provides mixin support through es2015 decorators.  `@mixin` will assign mixins in the order they are provided from left to right.

## Installation
```sh
npm i class-decorators -S
```
## Usage

```js
// myMixins.js
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
```

```js
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

#### React Component example using `@cascade`

[react-class-mixin](https://github.com/wescravens/react-class-mixin) will automatically decorate the following methods with `@cascade`.

```
render
getInitialState
getDefaultProps
propTypes
mixins
statics
displayName
componentWillMount
componentDidMount
componentWillReceiveProps
shouldComponentUpdate
componentWillUpdate
componentDidUpdate
componentWillUnmount
```

Using decorators to add mixins will cause your component lifecycle methods to be overwritten by methods used in the mixins.  Decorating your methods with `@cascade` will call the mixin functions first in the order they were applied.  Mixins are not required to be decorated with `@cascade` since decorating the component method will apply to all methods.  Returns from all methods will be returned in an array in the order the methods were called.

```js
import {Component} from 'react';

const MyComponentMixin = {
  componentDidMount() {
    ...
    // This function will be called just before the `componentDidMount`
    // method on the class this mixin is applied to
  }
}

const MyOtherComponentMixin = {
  componentDidMount() {
    ...
  }
}

@mixin(MyComponentMixin, MyOtherComponentMixin)
class MyComponent extends Component {
  @cascade
  componentDidMount() {
    // When this method is called, the order of function calls will be 
    // 1) MyComponentMixin.componentDidMount()
    // 2) MyOtherComponentMixin.componentDidMount()
    // 3) MyComponent.componentDidMount()
  }
}
```
