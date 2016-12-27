import {Api} from "../api";
import {map} from "../map";

export class HasMany {

  constructor(relation, resource, parent, params = null) {
    let self = this;
    self.relation = relation;
    self.resource = resource;
    self.parent = parent;
    self.params = params;
    self.api = new Api(self.parent._resource);
  }

  then(callback) {
    let self = this;
    if (self.parent.properties.hasOwnProperty(self.resource.toLowerCase())) {
      return map(self.relation, self.parent.properties[self.resource.toLowerCase()]).then(callback);
    }

    return self.api.relation(self.parent, self.relation, self.resource, self.params)
      .then(response => map(self.relation, response))
      .then(callback);
  }

  add(entity) {
    let self = this;
    let relation = [self.parent._name, "id"].join('_');
    entity[relation] = self.parent.id;
    return entity.save();
  }
}
