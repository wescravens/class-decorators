'use strict';

/**
 * Adds properties of mixin objects to Class
 * @param ...mixins Array of objects to merge with the a Class prototype
 * @returns {Function} Decorator function which will assign each mixin to the Class proto
 */
export function mixin (...mixins) {
  return function (TargetClass) {
    class Mixed extends TargetClass {}
    mixins = mixins.reverse();
    for (let mixin of mixins) {
      for (let prop in mixin) {
        let targetProto = TargetClass.prototype,
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
          let mixinProp = mixin[prop],
            currentProp = Mixed.prototype[prop] || TargetClass.prototype[prop];

          if ('function' !== typeof mixinProp) {
            // allow objects if property initializers become part of the ES7 class spec
            // https://esdiscuss.org/topic/es7-property-initializers
            // https://www.npmjs.com/package/babel-plugin-class-properties-7to6
            if ('object' === typeof mixinProp) {
              Mixed.prototype[prop] = Mixed.prototype[prop] || {};
              Object.assign(Mixed.prototype[prop], TargetClass.prototype[prop], mixinProp);
              continue;
            }

            throw new TypeError('@cascade can only decorate a class method or object' + typeof mixinProp);
          }

          Mixed.prototype[prop] = function cascadeWrapper () {
            return _flatten([mixinProp.apply(this, arguments), currentProp.apply(this, arguments)]);
          };

          continue;
        }

        Mixed.prototype[prop] = mixin[prop];
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
export function override (target, key) {
  return _addClassMetaFlag('__overrides__', target, key);
}

/**
 * Sets a flag to replace this method with one that calls mixins
 * with the same name first before this method is called
 * @param  {Class}  target     Class that the property is owned by
 * @param  {String} key        Property name
 * @return {void}
 */
export function cascade (target, key) {
  return _addClassMetaFlag('__cascades__', target, key);
}

function _addClassMetaFlag (metaKey, target, key) {
  target[metaKey] = target[metaKey] || {};
  target[metaKey][key] = true;
  return target;
}

/**
 * Utility function for flattening nested arrays
 */
function _flatten ([first, ...rest]) {
  if (first === undefined) {
    return [];
  } else if (!Array.isArray(first)) {
    return [first, ..._flatten(rest)];
  } else {
    return [..._flatten(first), ..._flatten(rest)];
  }
}
