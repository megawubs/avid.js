import {Interaction} from "./interaction";
import {map} from "../map";
let axios = require('axios');
export class LoadsFrom extends Interaction {

    then(callback) {
        let self = this;

        return axios
            .get(self.resource, {params: self.params})
            .then(response => response.data)
            .then(items => map(this.entity, items))
            .then(callback);
    }
}
