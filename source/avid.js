import {Api} from "./api";
import {map} from "./map";
import {ModelProxy} from "./proxyfy";
import {HasMany} from "./relations/hasMany";
import {BelongsTo} from "./relations/belongsTo";

/**
 * Avid
 *
 * An active record like approach to consuming an API, inspired by Laravel's Avid
 *
 * Example:
 *
 * export class User extends Avid{
 *    get _version(){
 *      return 'v1'
 *    }
 *
 *    posts(){
 *      return this.hasMany(Post, 'posts');
 *    }
 * }
 *
 * export class Post extends Avid{
 *   get _version(){
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
var AvidConfig = {
  baseUrl: null,
  storage: []
};
export class Avid {

  /**
   * Used to globally change the baseUrl. This is useful for when your
   * api is on an other domain or port.
   * usage:
   *    Avid.baseUrl = 'http://foo.com'
   * Do not use a trailing slash!
   *
   * @param url
   */
  static set baseUrl(url) {
    AvidConfig.baseUrl = url;
    return true;
  }

  static get baseUrl() {
    return AvidConfig.baseUrl;
  }

  //noinspection JSAnnotator
  static set storage(value) {
    AvidConfig.storage = value;
    return true;
  }

  /**
   * A way to retrieve the storage
   * @returns {Array}
   */
  static get storage() {
    return AvidConfig.storage
  }


  /**
   * The prefix to use for requests, this is appended as the first element
   * to the baseUrl. By default it is 'api'.
   * usage:
   *  Avid.baseUrl = 'http://foo.com'
   *  class User extends Avid{
   *    get _prefix(){
   *      return 'secret'
   *    }
   *  }
   *
   *  User.find(1) //request is made to http://foo.com/secret/user/1
   *
   * @returns {string}
   */
  get _prefix() {
    return 'api';
  }

  /**
   * Gives Avid models the ability to use the correct versioned url.
   * This will result in the following uri: '/api/v1'
   */
  get _version() {
    return null
  }

  get _name() {
    return this.constructor.name.toLowerCase();
  }

  get _resource() {
    return ((this._version === null) ? [this._prefix, this._name] : [this._prefix, this._version, this._name]).join('/');
  }

  constructor() {

    /**
     * First we are setting up the common properties like the name of the constructor and
     * the uri for the resource.
     *
     * Afterwards a proxy of this object is returned, this way we
     * can catch when a relation is requested and keep track of
     * changes made to the model.
     */
    this.initializeProperties();
    return this.proxify();
  }

  initializeProperties() {
    this.properties = {};
    this.originals = {};
  }

  /**
   * Fetch all items from the resource.
   *
   * @returns {Promise}
   */
  static all() {
    var model = new this;
    if (Avid.storage.hasOwnProperty(model._name)) {
      return map(this, Avid.storage[model._name]);
    }
    let api = new Api(model._resource);
    return api.all().then(response => map(this, response));
  }

  /**
   * Find as specific model by its id
   * @param id
   * @returns {Promise}
   */
  static find(id) {
    var model = new this;
    if (Avid.storage.hasOwnProperty(model._name)) {
      var items = Avid.storage[model._name].filter(model => model.id === id);
      return (items.length === 1) ? map(this, items[0]) : Promise.reject();
    }
    let api = new Api(model._resource);
    return api.find(id).then(response => map(this, response));
  }

  /**
   * Save or update an existing or new model
   * @returns {Promise}
   */
  save() {

    var self = this;
    let api = new Api(self._resource);

    /**
     * Resolve directly when there are no changes to the model, saving us
     * an exidental update or save of an unchanged model.
     */

    if (self.hasChanged === false) return Promise.resolve(self);

    /**
     * When we do `var model = new Model();` it has no id yet, this way we can
     * check if a model needs to be updated or saved
     */

    if (typeof self.id === 'undefined') {
      /**
       * When the id is not set, we assume the model is unknown to
       * the api. A create is necessary in this case so the api server
       * knows the model needs to be created, not updated.
       */
      return api.create(self.properties)
        .then(response => map(this, response))
        .catch(error => console.log("Failed saving modelProxy due to'", error));
    }

    /**
     * When there is an id, preform an update of the model
     */
    return api.update(self.properties)
      .then(response => map(this, response))
      .catch(error => self.reset());
  }

  delete() {
    var self = this;
    let api = new Api(self._resource);

    return api.delete(self.id);
  }

  /**
   * Defines a one to many relationship.
   *
   * @param relation
   * @param resource
   * @returns {HasMany}
   */
  hasMany(relation, resource) {
    return new HasMany(relation, resource, this.proxify());
  }

  /**
   * Defines a many to one relationship.
   *
   * @param parent
   * @returns {BelongsTo}
   */
  belongsTo(parent) {
    return new BelongsTo(parent, this.proxify());
  }

  /**
   * We need a way to register get and set actions on a model to be able to set
   * the properties directly on the model. ES6 has no thing like magic methods, instead
   * it has Proxy's. This is an object that sits in between the model it proxy's and
   * the model that the actions are being preformed on.
   *
   * This way, we can catch get and set operations on a Avid instance!
   * var user = new User();
   * user.name = 'Bram';
   *
   * the set action for the name property is intercepted by the proxy,
   * setting it on the properties property. By doing this, we can divide the Model it's properties
   * from Avid its properties.
   *
   * it also enables us to access relationships as properties
   * user.posts.then(//..)
   *
   * @returns {ModelProxy}
   */
  proxify() {
    return new ModelProxy(this);
  }

  reset() {
    var self = this;
    Object.keys(this.originals).forEach(key => {
      if (typeof self[key] !== 'function') {
        self[key] = self.originals[key];
      }
    });
    return self;
  }

  static fill() {
    Object.keys(avidItems).forEach(modelName => {
      Avid.storage[modelName] = avidItems[modelName];
    });
  }
}

