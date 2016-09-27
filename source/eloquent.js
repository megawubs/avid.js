import {Api} from "./api";
import {map} from "./map";
import {ModelProxy} from "./proxyfy";
import {HasMany} from "./relations/hasMany";
import {BelongsTo} from "./relations/belongsTo";

/**
 * Eloquentjs
 *
 * An active record like approach to consuming an API, inspired by Laravel's Eloquent
 *
 * Example:
 *
 * export class User extends Eloquent{
 *    get version(){
 *      return 'v1'
 *    }
 *
 *    posts(){
 *      return this.hasMany(Post, 'posts');
 *    }
 * }
 *
 * export class Post extends Eloquent{
 *   get version(){
 *    return 'v1'
 *   }
 *
 *   user(){
 *     return this.belongsTo(User);
 *   }
 * }
 *
 * User.find(1) //model fetched from api
 * .then(user => user.posts) //fetch relations from api
 * .then(posts => console.log(posts)); //log relations
 *
 *  Post.find(1) //model fetched from api
 *  .then(post => post.user) //fetch relation from api
 *  .then(post => console.log(post)); //log relation
 *
 *  var user = new User(); //new up a user
 *
 *  user.name = 'John'
 *  user.email = 'do@john.com'
 *  user.email = 'secret'
 *  user.save()
 *    .then(user => console.log(user.id)); //1 (saved user through the API)
 *
 *  User.find(1).then(user => {
 *    user.name = 'jane'
 *    user.email = 'do@jane.com'
 *    return user.save();
 *  }).then(updatedUser => console.log(updatedUser.name)); //jane
 */
export class Eloquent {

  /**
   * Gives Eloquentjs the ability to use the correct versioned url.
   * This will result in the following uri: '/api/v1'
   * @returns {string}
   */

  get version() {
    return 'v1';
  }

  constructor() {
    /**
     * First we are setting up the common properties like the name of the constructor and
     * the path for the resource.
     *
     * Afterwards a proxy of this object is returned.
     */
    this.initializeProperties();
    return this.proxify();
  }

  initializeProperties() {
    this.constructorName = this.constructor.name.toLowerCase();
    this.resource = this.constructorName;
    this.resource = (this.version === null) ? this.resource : this.version + '/' + this.resource;
    this.properties = {};
  }

  /**
   * Fetch all items from the resource.
   *
   * @returns {*}
   */
  static all() {
    var model = new this;
    let api = new Api(model.resource);
    return api.all().then(response => map(model, response));
  }

  /**
   * Find as specific model by its id
   * @param id
   * @returns {*}
   */
  static find(id) {
    var model = new this;
    let api = new Api(model.resource);
    return api.find(id).then(response => map(model, response));
  }

  /**
   * Save or update an existing or new model
   * @returns {*}
   */
  save() {
    /**
     * When we do `var model = new Model();` it
     */
    var self = this;
    let api = new Api(self.resource);

    if (self.hasChanged === false) return Promise.resolve(self);

    if (typeof self.id === 'undefined') {
      return api.create(self.properties)
        .then(response => map(self, response))
        .catch(error => console.log("Failed saving modelProxy due to'" + error.statusText));
    }

    return api.update(self.properties)
      .then(response => map(self, response))
      .catch(error => console.log(error));
  }

  hasMany(relation, resource) {
    return new HasMany(relation, resource, this.proxify());
  }

  belongsTo(parent) {
    return new BelongsTo(parent, this.proxify());
  }

  proxify() {
    return new ModelProxy(this);
  }
}

