import {expect, assert} from 'chai';
import {Eloquent} from "../source/eloquent";
import {User} from "./models/user";


beforeEach(function () {
  Eloquent.baseUrl = null;
});

describe('Model Test', () => {

  it('should load all items from modelProxy with Model.all()', () => {
    return User.all();
  });

  it('should get one item with Model.find(1)', () => {
    return User.find(1);
  });

  it('should create a new model when model is newed up', () => {
    var user = new User;
    user.name = 'Jan';
    user.email = 'jan@jan.com';
    user.password = 'secret';
    return user.save().then(user => {
      expect(user.id).to.be.a('number')
    });
  });

  it('should edit a model when model exists', () => {
    return User.find(1).then(user => {
      user.name = 'Willem';
      return user.save();
    }).then(user => {
      assert.equal(user.id, 1);
      assert.equal(user.name, 'Willem');
    });
  });


  it('should use a differen url for models when it is set', () => {
    Eloquent.baseUrl = 'http://blaat.foo';
    assert.equal(User.baseUrl, 'http://blaat.foo');
    return User.find(1).catch(error => {
      Eloquent.baseUrl = null; //reset

    });
  });

  it('should restore model when a update goes wrong', () => {
    return User.find(1).then(user => {
      var oldName = user.name;
      user.baseUrl = 'http://blaat.foo';
      user.name = 'fooo2';
      return user.save().then(() => {
        assert.equal(user.name, oldName);
      });
    });
  });
});

