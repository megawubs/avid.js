import {expect, assert} from 'chai';
import {Eloquent} from "../source/eloquent";

export class User extends Eloquent {

  get version() {
    return 'v1';
  }

  homes() {
    return this.hasMany(Home, 'homes');
  }
}

export class Home extends Eloquent {
  get version() {
    return 'v1'
  }

  user() {
    return this.belongsTo(User);
  }
}

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
    return user.save().then(user => expect(user.id).to.be.a('number'));
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
});

