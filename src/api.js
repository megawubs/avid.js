export class Api {
  constructor(resource) {
    this.resource = '/api/' + resource;
  }

  toJson(response) {
    return response['data'];
  }

  all() {
    return Vue.http.get(this.resource)
      .then(this.toJson);
  }

  find(id) {
    return Vue.http.get(this.resource + '/' + id)
      .then(this.toJson);
  }

  update(model) {
    var self = this;
    return Vue.http.put(this.resource + '/' + model.id, model)
      .then(self.toJson)
      .catch(self.toJson);
  }

  create(model) {
    var self = this;
    return Vue.http.post(this.resource, model)
      .then(self.toJson);
  }

  relation(model, relation, resource) {
    this.resource = [this.resource, model.id, resource].join('/');
    if (model.id === undefined) return Promise.reject('Unable to find relation, modelProxy is not yet saved.');
    return this.all();
  }
}
