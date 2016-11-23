import {Avid} from "./avid";
/**
 * Communication layer for the api
 */
export class Api {
  /**
   * The api needs the name of the resource model to get
   * so that it can build the uri required to reach it
   * @param resource
   */
  constructor(resource) {
    this.resource = resource;
  }

  getJson(response) {
    console.log('getting json...');
    return response['data'];
  }

  all() {
    return Vue.http
      .get(this.url())
      .then(this.getJson);
  }

  find(id) {
    return Vue.http
      .get(this.url(id))
      .then(this.getJson);
  }

  update(model) {
    return Vue.http
      .put(this.url(model.id), model)
      .then(this.getJson);
  }

  delete(id) {
    return Vue.http
      .delete(this.url(id))
  }

  create(model) {
    return Vue.http
      .post(this.url(), model)
      .then(this.getJson);
  }

  relation(model, relation, resource) {
    if (model.id === undefined) return Promise.reject('Unable to find relation, model has no identifier.');
    var api = new Api(this.uri(model.id, resource));
    return api.all();
  }

  uri(...parts) {
    parts.splice(0, 0, this.resource);
    return parts.join('/').toLowerCase();
  }

  url(...parts) {
    parts.splice(0, 0, [Avid.baseUrl, this.resource].join('/'));
    return parts.join('/').toLowerCase();
  }
}


