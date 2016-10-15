/**
 * Communication layer for the api
 */
export class Api {
  /**
   * The api needs the name of the resource model to get
   * so that it can build the uri required to reach it
   * @param base
   * @param resource
   */
  constructor(base, resource) {
    let url = (typeof base === 'undefined' || base === null) ? ['api', resource] : [base, resource];
    this.resource = url.join('/');
  }

  getJson(response) {
    return response['data'];
  }

  all() {
    return Vue.http
      .get(this.uri())
      .then(this.getJson);
  }

  find(id) {
    return Vue.http
      .get(this.uri(id))
      .then(this.getJson);
  }

  update(model) {
    return Vue.http
      .put(this.uri(model.id), model)
      .then(this.getJson)
  }

  create(model) {
    return Vue.http
      .post(this.uri(), model)
      .then(this.getJson);
  }

  relation(model, relation, resource) {
    if (model.id === undefined) return Promise.reject('Unable to find relation, model is not yet saved.');
    var api = new Api(this.resource, model.id + '/' + resource);
    return api.all();
  }

  uri(...parts) {
    parts.splice(0, 0, this.resource);
    return parts.join('/');
  }
}


