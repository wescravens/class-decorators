'use strict';

/**
 * Adds properties of mixin objects to Class
 * @param ...mixins Array of objects to merge with the a Class prototype
 * @returns {Function} Decorator function which will assign each mixin to the Class proto
 */
export function mixin (...mixins) {
    return function (TargetClass) {
        class Mixed extends TargetClass {}
        for (let mixin of mixins) {
            for (let prop in mixin) {
                let descriptor = Object.getOwnPropertyDescriptor(TargetClass.prototype, prop);
                if (descriptor && !descriptor.writable) {
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
 * @param target
 * @param key
 * @param descriptor
 */
export function override (target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}
