import {expect, assert} from 'chai';
import {Eloquent} from "../../source/eloquent";
import {User} from "./models/user";

beforeEach(function () {
  Eloquent.baseUrl = 'http://localhost:8000/api';
  Eloquent.storage = {}
});
window.avidItems = {};
describe('Prefill', () => {
  it('should not make a http request', () => {
    avidItems["User"] = [{
      id: 1,
      name: 'Megawubs',
      email: 'mega@wubs.com'
    }];

    Eloquent.fill();

    return User.all().then(users => {
      assert.equal(1, users.length);
    });
  });

  it('should not make a http request when requested id is in storage', () => {
    avidItems["User"] = [{
      id: 600000,
      name: 'Megawubs',
      email: 'mega@wubs.com'
    }];

    Eloquent.fill();

    return User.find(600000).then(user => {
      assert.equal(user.id, 600000);
    })
  });
});
