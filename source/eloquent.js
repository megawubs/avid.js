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
var EloquentjsConfig = {
  baseUrl: null,
  version: 'v1',
  storage: []
};
export class Eloquent {

  /**
   * Gives Eloquentjs the ability to use the correct versioned url.
   * This will result in the following uri: '/api/v1'
   * @returns {string}
   */

  static get version() {
    return EloquentjsConfig.version;
  }

  //noinspection JSAnnotator
  static set version(version) {
    EloquentjsConfig.version = version;
    return true;
  }

  static set baseUrl(url) {
    EloquentjsConfig.baseUrl = url;
    return true;
  }

  static get baseUrl() {
    return EloquentjsConfig.baseUrl;
  }

  static set storage(value) {
    EloquentjsConfig.storage = value;
    return true;
  }

  static get storage() {
    return EloquentjsConfig.storage
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
    this.constructorName = this.constructor.name;
    this.resource = (this.version === null) ? this.constructorName : this.version + '/' + this.constructorName;
    this.properties = {};
    this.originals = {};
  }

  /**
   * Fetch all items from the resource.
   *
   * @returns {*}
   */
  static all() {
    var model = new this;
    if (Eloquent.storage.hasOwnProperty(model.constructorName)) {
      return map(this, Eloquent.storage[model.constructorName]);
    }
    let api = new Api(Eloquent.baseUrl, model.resource);
    return api.all().then(response => map(this, response));
  }

  /**
   * Find as specific model by its id
   * @param id
   * @returns {*}
   */
  static find(id) {
    var model = new this;
    console.log(Eloquent.storage);
    console.log(model.constructorName);
    if (Eloquent.storage.hasOwnProperty(model.constructorName)) {
      var items = Eloquent.storage[model.constructorName].filter(model => model.id === id);
      return (items.length === 1) ? map(this, items[0]) : Promise.reject();
      // return Eloquent.storage[model.constructorName].then(models => {
      //   let result = models.filter(model => model.id === id);
      //   return (result.length === 1) ? result[0] : Promise.reject();
      // });
    }
    let api = new Api(Eloquent.baseUrl, model.resource);
    return api.find(id).then(response => map(this, response));
  }

  /**
   * Save or update an existing or new model
   * @returns {*}
   */
  save() {

    var self = this;
    let api = new Api(Eloquent.baseUrl, self.resource);

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
      .catch(error =>map(self, self.originals));
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
   * This way, we can catch get and set operations on a Eloquent instance!
   * var user = new User();
   * user.name = 'Bram';
   *
   * the set action for the name property is intercepted by the proxy,
   * setting it on the properties property. By doing this, we can divide the Model it's properties
   * from Eloquent its properties.
   *
   * it also enables us to access relationships as properties
   * user.posts.then(//..)
   *
   * @returns {ModelProxy}
   */
  proxify() {
    return new ModelProxy(this);
  }

  static fill() {
    Object.keys(avidItems).forEach(modelName => {
      Eloquent.storage[modelName] = avidItems[modelName];
    });
    console.log(Eloquent.storage);
  }
}

