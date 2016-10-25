import {Api} from "../api";
import {map} from "../map";
import {Eloquent} from "../eloquent";

export class HasMany {

  constructor(relation, resource, parent) {
    var self = this;
    self.relation = relation;
    self.resource = resource;
    self.parent = parent;
    self.api = new Api(Eloquent.baseUrl, self.parent.resource);
  }

  then(callback) {
    var self = this;
    console.log(self.parent.properties);
    if (self.parent.properties.hasOwnProperty(self.resource)) {
      console.log('keeping it in the family');
      return Promise.resolve(map(self.relation, self.parent.properties[self.resource]))
    }
    console.log('fetching from api');
    return self.api.relation(self.parent, self.relation, self.resource)
      .then(response => map(self.relation, response))
      .then(callback);
  }

  add(entity) {
    var self = this;
    var relation = [self.parent.constructorName.toLowerCase(), "id"].join('_');
    entity[relation] = self.parent.id;
    console.log(entity);
    return entity.save();
  }
}
