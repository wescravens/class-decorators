'use strict'

/**
 * Adds properties of mixin objects to Class
 * @param ...mixins Array of objects to merge with the a Class prototype
 * @returns {Function} Decorator function which will assign each mixin to the Class proto
 */
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;
exports.override = override;
exports.cascade = cascade;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mixin() {
  for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
    mixins[_key] = arguments[_key];
  }

  return function (TargetClass) {
    var Mixed = (function (_TargetClass) {
      _inherits(Mixed, _TargetClass);

      function Mixed() {
        _classCallCheck(this, Mixed);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Mixed).apply(this, arguments));
      }

      return Mixed;
    })(TargetClass);

    mixins = mixins.reverse();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mixins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _mixin = _step.value;

        for (var prop in _mixin) {
          var targetProto = TargetClass.prototype,
              cascades = targetProto.__cascades__,
              overrides = targetProto.__overrides__,
              hasProp = targetProto[prop] != null,
              shouldCascade = cascades && cascades[prop],
              shouldOverride = overrides && overrides[prop];

          if (shouldOverride) {
            Mixed.prototype[prop] = TargetClass.prototype[prop];
            continue;
          }

          if (shouldCascade) {
            var _ret = (function () {
              var mixinProp = _mixin[prop],
                  currentProp = Mixed.prototype[prop] || TargetClass.prototype[prop];

              if ('function' !== typeof mixinProp) {
                // allow objects if property initializers become part of the ES7 class spec
                // https://esdiscuss.org/topic/es7-property-initializers
                // https://www.npmjs.com/package/babel-plugin-class-properties-7to6
                if ('object' === (typeof mixinProp === 'undefined' ? 'undefined' : _typeof(mixinProp))) {
                  Mixed.prototype[prop] = Mixed.prototype[prop] || {};
                  Object.assign(Mixed.prototype[prop], TargetClass.prototype[prop], mixinProp);
                  return 'continue';
                }

                throw new TypeError('@cascade can only decorate a class method or object' + (typeof mixinProp === 'undefined' ? 'undefined' : _typeof(mixinProp)));
              }

              Mixed.prototype[prop] = function cascadeWrapper() {
                return _flatten([mixinProp.apply(this, arguments), currentProp.apply(this, arguments)]);
              };

              return 'continue';
            })();

            if (_ret === 'continue') continue;
          }

          Mixed.prototype[prop] = _mixin[prop];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return Mixed;
  };
}

/**
 * Allows a Class method or property to take priority over any mixins with the same name
 * when using the @mixin decorator
 * @param   {Class}  target     Class that the property is owned by
 * @param   {String} key        Property name
 * @returns {object} modified property descriptor
 */
function override(target, key) {
  return _addClassMetaFlag('__overrides__', target, key);
}

/**
 * Sets a flag to replace this method with one that calls mixins
 * with the same name first before this method is called
 * @param  {Class}  target     Class that the property is owned by
 * @param  {String} key        Property name
 * @return {void}
 */
function cascade(target, key) {
  return _addClassMetaFlag('__cascades__', target, key);
}

function _addClassMetaFlag(metaKey, target, key) {
  target[metaKey] = target[metaKey] || {};
  target[metaKey][key] = true;
  return target;
}

/**
 * Utility function for flattening nested arrays
 */
function _flatten(_ref) {
  var _ref2 = _toArray(_ref);

  var first = _ref2[0];

  var rest = _ref2.slice(1);

  if (first === undefined) {
    return [];
  } else if (!Array.isArray(first)) {
    return [first].concat(_toConsumableArray(_flatten(rest)));
  } else {
    return [].concat(_toConsumableArray(_flatten(first)), _toConsumableArray(_flatten(rest)));
  }
}
