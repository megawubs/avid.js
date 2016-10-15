import {Eloquent} from "../../source/eloquent";
import {Home} from "./home";

export class User extends Eloquent {

  get version() {
    return 'v1';
  }

  homes() {
    return this.hasMany(Home, 'homes');
  }
}
