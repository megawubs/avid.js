import {Avid} from "../avid";

export class Interaction {
  constructor(entity, source, params = null) {
    this.source = source;
    this.params = params;
    this.entity = entity;
    this.resource = [Avid.baseUrl, entity._resource, entity.id, source].join('/');
  }

}
