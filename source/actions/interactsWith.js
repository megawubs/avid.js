import {Interaction} from "./interaction";
let axios = require('axios');

export class InteractsWith extends Interaction {

    then(callback) {
        let self = this;

        return axios
            .post(self.resource, self.params)
            .then(response => response.data)
            .then(callback);
    }
}
