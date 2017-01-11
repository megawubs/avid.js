import {Avid} from "../../../source/avid";
import {Home} from "./home";

export class User extends Avid {

    constructor() {
        return super()
    }

    get _version() {
        return 'v1';
    }

    homes() {
        return this.hasMany(Home, 'homes');
    }
}
