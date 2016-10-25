import {Api} from "../api";
import {map} from "../map";
import {Eloquent} from "../eloquent";

export class BelongsTo {
  constructor(parent, child) {
    this.child = child;
    this.parent = new parent;
    this.api = new Api(Eloquent.baseUrl, this.parent.resource);

    this.relationAccessor = this.parent.constructorName.toLowerCase();
    if (this.child.properties.hasOwnProperty(this.relationAccessor)) {
      this.relationValue = this.child.properties[this.relationAccessor];
    }
  }

  then(callback) {
    var self = this;
    if (typeof this.relationValue !== 'undefined') {
      return map(self.parent, self.relationValue).then(callback);
    }
    var relation = [self.parent.constructorName.toLowerCase(), "id"].join('_');
    return self.api.find(self.child[relation]).then(callback);
  }
}
