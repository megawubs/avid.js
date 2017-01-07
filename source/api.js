import {Avid} from "./avid";
let axios = require('axios');
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
        return response['data'];
    }

    all(params = null) {
        return axios
            .get(this.url(), {params: params == null ? {} : params})
            .then(this.getJson);
    }

    find(id, params = null) {
        return axios
            .get(this.url(id), {params: params == null ? {} : params})
            .then(this.getJson);
    }

    update(model) {
        return axios
            .put(this.url(model.id), model)
            .then(this.getJson);
    }

    delete(id) {
        return axios
            .delete(this.url(id))
    }

    create(model) {
        return axios
            .post(this.url(), model)
            .then(this.getJson);
    }

    relation(model, relation, resource, params = null) {
        if (model.id === undefined) return Promise.reject('Unable to find relation, model has no identifier.');
        let api = new Api(this.uri(model.id, resource));
        return api.all(params);
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


