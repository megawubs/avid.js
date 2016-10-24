import {expect, assert} from 'chai';
import {Eloquent} from "../../source/eloquent";
import {User} from "./models/user";

beforeEach(function () {
  Eloquent.baseUrl = 'http://localhost:8000/api';
  Eloquent.storage = {}
});

describe('Prefill Test', () => {
  it('should not make a http request', () => {
    User.fill([{
      id: 1,
      name: 'Megawubs',
      email: 'mega@wubs.com'
    }]);

    return User.all().then(users => {
      assert.equal(1, users.length);
    });
  });

  it('should not make a http request when requested id is in storage', () => {
    User.fill([{
      id: 600000,
      name: 'Megawubs',
      email: 'mega@wubs.com'
    }]);

    return User.find(600000).then(user => {
      assert.equal(user.id, 600000);
    })
  });
});
