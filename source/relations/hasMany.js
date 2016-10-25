import {Api} from "../api";
import {map} from "../map";
import {Avid} from "../avid";

export class HasMany {

  constructor(relation, resource, parent) {
    var self = this;
    self.relation = relation;
    self.resource = resource;
    self.parent = parent;
    self.api = new Api(Avid.baseUrl, self.parent.resource);
  }

  then(callback) {
    var self = this;
    if (self.parent.properties.hasOwnProperty(self.resource.toLowerCase())) {
      return map(self.relation, self.parent.properties[self.resource.toLowerCase()]).then(callback);
    }

    return self.api.relation(self.parent, self.relation, self.resource)
      .then(response => map(self.relation, response))
      .then(callback);
  }

  add(entity) {
    var self = this;
    var relation = [self.parent.constructorName.toLowerCase(), "id"].join('_');
    entity[relation] = self.parent.id;
    return entity.save();
  }
}
