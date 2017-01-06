import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";
import {User} from "./models/user";
import {Group} from "./models/group";
import {InteractsWith} from "../../source/actions/interactsWith"

beforeEach(function () {
    Avid.baseUrl = 'http://localhost:3000';
});

describe('Actions ', () => {
    it('should be able to preform an action', () => {
        let user = new User();
        user.name = 'Henk';
        user.id = 1;
        let group = new Group();
        group.id = 1;
        let action = group.invite(user);
        assert.instanceOf(action, InteractsWith);
        assert.equal(action.resource, 'http://localhost:3000/api/v1/user/1/invite');
    });

});
