import {Api} from "../api";
import {Eloquent} from "../eloquent";

export class BelongsTo {
  constructor(parent, child) {
    this.child = child;
    this.parent = new parent;
    this.api = new Api(Eloquent.baseUrl, this.parent.resource);
  }

  then(callback) {
    var self = this;
    var relation = [self.parent.constructorName, "id"].join('_');
    console.log(self.child[relation]);
    return self.api.find(self.child[relation]).then(callback);
  }
}
