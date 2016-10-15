export class ModelProxy {

  static get accessibleMethods() {
    return ['all', 'find', 'save', 'restore'];
  }

  static get accessibleProperties() {
    return ['resource', 'properties', 'constructorName', 'hasChanged', 'originals'];
  }

  static get accessible() {
    return ModelProxy.accessibleProperties.concat(ModelProxy.accessibleMethods);

  }

  constructor(model) {
    var self = this;
    model.hasChanged = false;
    return new Proxy(model, {
      get: function (target, name, receiver) {
        if (self.isRelation(target, name)) return target[name]();
        if (self.canAccessProperty(name)) return target[name];
        if (name === 'proxify') return receiver;

        return target[name];
      },
      set: function (target, name, value) {
        target.hasChanged = true;
        target['properties'][name] = value;
        target[name] = value;
        return true;
      }
    });
  }

  canAccessProperty(name) {
    return ModelProxy.accessible.indexOf(name) >= 0;
  }

  isRelation(target, name) {
    return typeof target[name] === 'function' && ModelProxy.accessibleMethods.indexOf(name) === -1;
  }
}

export function modelProxy(model) {
  return new ModelProxy(model);
}
