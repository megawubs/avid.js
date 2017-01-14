import {Api} from "./api";
import {map} from "./map";
import {ModelProxy} from "./proxyfy";
import {HasMany} from "./relations/hasMany";
import {BelongsTo} from "./relations/belongsTo";
import {InteractsWith} from "./actions/interactsWith";
import {LoadsFrom} from "./actions/loadsFrom";
import {validate} from 'validate.js'

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
 *  let user = new User(); //new up a user
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
let AvidConfig = {
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
     * For example
     * get _version(){
   *   return 'v1';
   * }
     * Will result in the following uri: '/api/v1'
     */
    get _version() {
        return null
    }

    /**
     * The name of the entity. This is used to build the resource url for the entity.
     *
     * @returns {string}
     * @private
     */
    get _name() {
        return this.constructor.name.toLowerCase();
    }

    /**
     * The full resource for the entity.
     * It includes the prefix, version and name. If no version is set
     * it's not used and the resource will become the prefix and name
     *
     * @returns {string}
     * @private
     */
    get _resource() {
        return ((this._version === null && this._prefix !== null)
                ? [this._prefix, this._name]
                : (this._version === null && this._prefix === null)
                    ? [this._name]
                    : [this._prefix, this._version, this._name]
        ).join('/');
    }

    get _rules() {
        return {};
    }

    constructor() {

        /**
         * A proxy of this object is returned during construction, this way we
         * can catch when a relation is requested and keep track of
         * changes made to the model.
         */
        this.properties = {};
        this.originals = {};
        return this.proxify();
    }

    /**
     * Fetch all items from the resource.
     *
     * @returns {Promise}
     */
    static all() {
        let model = new this;
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
        let model = new this;
        if (Avid.storage.hasOwnProperty(model._name)) {
            let items = Avid.storage[model._name].filter(model => model.id === id);
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

        let self = this;
        let api = new Api(self._resource);

        /**
         * Resolve directly when there are no changes to the model, saving us
         * an exidental update or save of an unchanged model.
         */

        if (self.hasChanged === false) return Promise.reject(self);

        /**
         * Validate the model based on validate.js validation rules
         */
        let validation = self.validate();
        if (validation !== undefined) return Promise.reject(validation);
        /**
         * When we do `let model = new Model();` it has no id yet, this way we can
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
                .catch(error => console.warn("Failed saving " + self._name + " due to'", error));

        }

        /**
         * When there is an id, preform an update of the model
         */
        return api.update(self.properties)
            .then(response => map(this, response))

    }

    delete() {
        let self = this;
        let api = new Api(self._resource);

        return api.delete(self.id);
    }

    /**
     * Defines a one to many relationship.
     *
     * @param relation
     * @param resource
     * @param params
     * @returns {HasMany}
     */
    hasMany(relation, resource, params = null) {
        return new HasMany(relation, resource, this.proxify(), params);
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
     * Defines an action method to interact with other
     * entities or itself, in other words: it changes information.
     * Lets say we have two models: User and Group.
     * A user can join a group and a group can invite users.
     *
     * group.invite(user); //a group invites a user.
     * user.accept(invite); // a user accepts a invite.
     * user.join(group); // a user joins a group.
     * user.leave(group); //a user leaves a group.
     * group.ban(user); //a group bans a user.
     *
     * @param entity
     * @param source
     * @param params
     * @returns {InteractsWith}
     */
    interactsWith(entity, source, params = null) {
        //make it possible to omit 'this' when the interaction is with the same object.
        if (typeof entity === 'string') return new InteractsWith(this, entity, source);
        return new InteractsWith(entity, source, params);
    }

    /**
     * Makes it possible to do Model.interactsWith.
     * This is  useful when you have a interaction directly on the
     * resource, like this: [post] api/v1/group/search. The method for this will be:
     *
     * Definition:
     * export class Group extends Avid{
   *
   *  static search(query){
   *    return this.interactsWith('search', {query: query};
   *  }
   *
   * }
     *
     * Usage:
     * Group.search('stuff').then(result => {...});
     * @param source
     * @param params
     * @returns {InteractsWith}
     */
    static interacsWith(source, params = null) {
        let model = new this;
        return model.interactsWith(this, source, params);
    }

    /**
     * Defines an action method that only retrieves information. It does not make changes.
     * Lets say we have two models: User and Group.
     *
     * A group has metrics and a user has extended profile information
     * group.metrics(); //get the group metrics
     * user.extendedProfile(); //gt the extended user profile
     *
     * @param entity
     * @param source
     * @param params
     * @returns {LoadsFrom}
     */
    loadsFrom(entity, source, params = null) {
        if (typeof entity === 'string') return new LoadsFrom(this, entity, source);
        return new LoadsFrom(entity, source, params);
    }

    /**
     * Makes it possible to do Model.loadsFrom.
     * This is  useful when you have an action directly on the
     * resource, like this: [get] api/v1/group/search. The method for this will be:
     *
     * Definition:
     * export class Group extends Avid{
   *
   *  static search(query){
   *    return this.loadsFrom('search', {query: query};
   *  }
   *
   * }
     *
     * Usage:
     * Group.search('stuff').then(result => {...});
     *
     * @param source
     * @param params
     * @returns {LoadsFrom}
     */
    static loadsFrom(source, params = null) {
        let model = new this;
        return model.loadsFrom(this, source, params);
    }

    /**
     * We need a way to register get and set actions on a model to be able to set
     * the properties directly on the model. ES6 has no thing like magic methods, instead
     * it has Proxy's. This is an object that sits in between the object it proxy's and
     * the object that the actions are being preformed on.
     *
     * This way, we can catch get and set operations on a Avid instance!
     * let user = new User();
     * user.name = 'Bram';
     *
     * the set action for the name property is intercepted by the proxy,
     * setting it on the properties property. By doing this we can keep track of changes and
     * revert them if needed.
     *
     *
     * @returns {ModelProxy}
     */
    proxify() {
        return new ModelProxy(this);
    }

    validate() {
        return validate(this.properties, this._rules)
    }

    reset(error) {
        let self = this;
        Object.keys(this.originals).forEach(key => {
            if (typeof self[key] !== 'function') {
                self[key] = self.originals[key];
            }
        });
        return Promise.reject(error);
    }

    static fill() {
        Object.keys(avidItems).forEach(modelName => {
            Avid.storage[modelName] = avidItems[modelName];
        });
    }
}

