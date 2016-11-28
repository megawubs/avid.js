import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";
import {User} from "./models/user";
import {Group} from "./models/group";

beforeEach(function () {
  Avid.baseUrl = 'http://framework.dev';
});

describe('Actions ', () => {
  it('should be able to preform an action', () => {
    let user = new User();
    user.name = 'Henk';
    user.id = 1;
    let group = new Group();
    group.id = 1;
    return group.invite(user).then(response => {
      console.log(response);
    });
    // return user.save()
    //   .then((user) => {
    //
    //   });
  });

});
