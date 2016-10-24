import {Eloquent} from "../../../source/eloquent";
import {User} from "./user";

export class Home extends Eloquent {
  get version() {
    return 'v1'
  }

  user() {
    return this.belongsTo(User);
  }
}
