import {Api} from "../api";
import {map} from "../map";

export class BelongsTo {
  constructor(parent, child) {
    this.child = child;

    /**
     * create a new instance of the parent.
     * When defining a BelongsTo relation the constructor
     * for the parent relation is passed, here it's newed up
     * and available for us to use.
     */
    this.parent = new parent;

    /**
     * create an api wrapper with the parent as resource uri.
     * this way we can do a get with an id on the parents
     * api endpoint.
     */
    this.api = new Api(this.parent._resource);

    /**
     * If the child has the parent eager loaded we can resolve it without accessing
     * the api.
     */
    if (this.child.properties.hasOwnProperty(this.parent._name)) {
      this.relationValue = this.child.properties[this.parent._name];
    }
  }

  then(callback) {
    var self = this;

    /**
     * when the relation is eager loaded, return the promise that
     * maps it to a proxy.
     */
    if (typeof this.relationValue !== 'undefined') {
      return map(self.parent, self.relationValue).then(callback);
    }

    /**
     * when there is no relation eager loaded, build up an
     * accessor for the relation id, by default Avid assumes it is
     * `modelname_id`.
     *  Example:
     *  When a Home belongs to a User with id 3, the key to access the id of the user
     *  is assumed to be 'user_id'. With this key we can access the
     *  value of Home.user_id, giving us the id of the user this home belongs to.
     */
    var relation = [self.parent._name, "id"].join('_');

    /**
     * Fetch the relation from the api, using it's own api resource endpoint.
     */
    return self.api.find(self.child[relation]).then(user => {
      return map(this.parent, user);
    }).then(callback);
  }
}
