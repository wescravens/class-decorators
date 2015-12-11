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
        let descriptor = Object.getOwnPropertyDescriptor(TargetClass.prototype, prop),
          cascades = TargetClass.prototype.__cascades__;

        if (!descriptor) {
          Mixed.prototype[prop] = mixin[prop];
        } else {
          if (cascades && cascades[prop]) {
            let mixedProp = Mixed.prototype[prop],
              mixinProp = mixin[prop];

            if (mixedProp) {
              if ('function' !== typeof mixinProp) {
                throw new TypeError('@cascade can only decorate a class method' + typeof mixinProp);
              }

              let lastMixinProp = Mixed.prototype[prop];
              Mixed.prototype[prop] = function cascadeWrapper () {
                return _flatten([mixinProp.apply(this, arguments), lastMixinProp.apply(this, arguments)]);
              }
            }
            continue;
          }

          if (descriptor.writable) {
            Mixed.prototype[prop] = mixin[prop];
          }
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
 * @param   {Object} descriptor Property descriptor
 * @returns {object} modified property descriptor
 */
export function override (target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

/**
 * Sets a flag to replace this method with one that calls mixins
 * with the same name first before this method is called
 * @param  {Class}  target     Class that the property is owned by
 * @param  {String} key        Property name
 * @param  {Object} descriptor Property descriptor
 * @return {void}
 */
export function cascade (target, key, descriptor) {
  target.__cascades__ = target.__cascades__ || {};
  target.__cascades__[key] = true;
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
