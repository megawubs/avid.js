export class ModelProxy {

    static get accessibleProperties() {
        return ['resource', 'properties', 'constructorName', 'hasChanged', 'originals', 'prefix'];
    }

    static get accessible() {
        return ModelProxy.accessibleProperties.concat(ModelProxy.accessibleMethods);

    }

    constructor(model) {
        let self = this;
        model.hasChanged = false;
        return new Proxy(model, {
            get: function (target, name, receiver) {
                if (name === 'proxify') return () => receiver;
                if (self.isMethod(target, name)) return target[name];
                if (self.canAccessProperty(name)) return target[name];

                return target[name];
            },
            set: function (target, name, value) {
                target.hasChanged = true;
                target['properties'][name] = value;
                target[name] = value;

                return true;
            },
            getPrototypeOf: function () {
                return model;
            }
        });
    }

    canAccessProperty(name) {
        return ModelProxy.accessible.indexOf(name) >= 0;
    }

    isMethod(target, name) {
        return typeof target[name] === 'function';
    }
}
