import {Interaction} from "./interaction";
import {map} from '../map'
export class LoadsFrom extends Interaction {

  then(callback) {
    var self = this;

    return Vue.http
      .get(self.resource, {params: self.params})
      .then(response => response.data)
      .then(items => map(this.entity, items))
      .then(callback);
  }
}
