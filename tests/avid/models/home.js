import {Avid} from "../../../source/avid";
import {User} from "./user";

export class Home extends Avid {
  get _version() {
    return 'v1'
  }

  user() {
    return this.belongsTo(User);
  }
}
