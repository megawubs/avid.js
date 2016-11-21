import {Interaction} from "./interaction";
export class InteractsWith extends Interaction {

  then(callback) {
    var self = this;

    return Vue.http
      .post(self.resource, self.params)
      .then(response => response.data)
      .then(callback);
  }
}
