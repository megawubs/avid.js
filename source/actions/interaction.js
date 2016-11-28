import {Avid} from "../avid";

export class Interaction {
  constructor(entity, source, params = null) {
    this.source = source;
    this.params = params;
    console.log('Interaction::constructor', this.params);
    this.entity = entity;
    this.resource = [Avid.baseUrl, entity._resource, entity.id, source].join('/');
  }

}
