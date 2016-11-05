import {Interaction} from "./interaction";
export class LoadsFrom extends Interaction {

  then(callback) {
    var self = this;

    return Vue.http
      .get(self.resource, {params: self.params})
      .then(response => response.data)
      .then(callback);
  }
}
