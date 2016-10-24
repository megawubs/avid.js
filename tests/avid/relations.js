import {expect, assert} from 'chai';
import {HasMany} from '../../source/relations/hasMany';
import {User} from "./models/user";
import {Home} from "./models/home";
import {Eloquent} from "../../source/eloquent";

beforeEach(function () {
  Eloquent.baseUrl = 'http://localhost:8000/api';
});

describe('Relation test', () => {
  it('Can access relation by property', () => {
    return User.find(1)
      .then(user => user.homes)
      .then(homes => {
        assert.instanceOf(homes, Array);
      });
  });
  it('relation prorerty returns relation object', () => {
    return User.find(1).then(user => {
      assert.instanceOf(user.homes, HasMany);
    });
  });

  it('can add a relation', () => {
    var user;
    var home = new Home();

    home.name = 'The Little Walls';
    return User.find(1).then(result => {
      user = result;
      console.log(user.home);
      return user.homes.add(home);
    }).then(home => {
      return user.homes.then(homes => {
        assert.equal(homes[0].name, home.name);
        assert.equal(homes[0].user_id, user.id);
      });
    });
  });

  it('can reverse a relation', () => {
    let user_id = 3;
    return Home.find(1).then(home => home.user)
      .then(user => {
        assert.equal(user.id, user_id);
      });
  });

  it('can handle eager loading', () => {
    return User.find(1).then(user => {
      return user.homes.then(homes => {
        assert.instanceOf(homes, Array);
        assert.instanceOf(homes[0], Home);
      })
    });
  });
});
