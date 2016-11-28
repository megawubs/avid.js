import {expect, assert} from 'chai';
import {HasMany} from '../../source/relations/hasMany';
import {User} from "./models/user";
import {Home} from "./models/home";
import {Avid} from "../../source/avid";
var madeRequest = false;

beforeEach(function () {
  Avid.baseUrl = 'http://framework.dev';
  madeRequest = false;
  Vue.http.interceptors.push((request, next) => {
    madeRequest = true;
    next();
  });
});


describe('Relations ', () => {

  it('Can access hasMany relation by property ', () => {
    return User.find(1)
      .then(user => user.homes())
      .then(homes => {
        assert.instanceOf(homes, Array);
        assert.equal(madeRequest, false);
      });
  });

  it('can access belongsTo relation by property ', () => {
    var myHome = {};
    return Home.find(1)
      .then(home => {
        myHome = home;
        return home.user()
      })
      .then(user => {
        assert.equal(myHome.user_id, user.id);
        assert.equal(madeRequest, false);
      })
  });

  it('relation prorerty returns relation object ', () => {
    return User.find(1).then(user => {
      assert.instanceOf(user.homes(), HasMany);
    });
  });

  it('can add a relation ', () => {
    var user;
    var home = new Home();

    home.name = 'The Little Walls';
    return User.find(1).then(result => {
      user = result;
      return user.homes().add(home);
    }).then(home => {
      return user.homes().then(homes => {
        assert.equal(homes[0].name, home.name);
        assert.equal(homes[0].user_id, user.id);
        assert.equal(madeRequest, true);
      });
    });
  });

  it('can reverse a relation ', () => {
    let user_id = 1;
    return Home.find(1).then(home => home.user())
      .then(user => {
        assert.equal(user.id, user_id);
        assert.equal(madeRequest, false);
      });
  });

  it('can handle eager loading ', () => {
    return User.find(1).then(user => {
      return user.homes().then(homes => {
        assert.instanceOf(homes, Array);
        assert.instanceOf(homes[0], Home);
        assert.equal(madeRequest, false);
      })
    });
  });

  it('can fetch a hasMany relation from the api ', () => {
    return User.all().then(users => {
      return users[0].homes();
    }).then(homes => {
      assert.instanceOf(homes, Array);
      assert.instanceOf(homes[0], Home);
      assert.equal(madeRequest, true);
    });
  });

  it('can fetch a belongsTo relation from the api', () => {
    return Home.all().then(home => home[0].user()).then(user => {
      assert.instanceOf(user, User);
      assert.equal(madeRequest, true);
    })
  });


});
