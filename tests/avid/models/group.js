import {Avid} from "../../../source/avid";
import {User} from "./user";

export class Group extends Avid {

    constructor() {
        return super()
    }
    
    get _version() {
        return 'v1';
    }

    users() {
        return this.hasMany(User, 'users');
    }

    invite(user) {
        return this.interactsWith(user, 'invite', {group_id: this.id});
    }

    join(user) {
        return this.interactsWith('join', {user_id: user.id}); //api/v1/group/join
    }

    ban(user) {
        return this.interactsWith('ban', {user_id: user.id});
    }

    metrics() {
        return this.loadsFrom('metrics');
    }
}
