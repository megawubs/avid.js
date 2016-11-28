import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";


class User extends Avid {

  get _version() {
    return 'v2';
  }

  get _prefix() {
    return 'oauth'
  }
}

class Awesomness extends Avid {

}

class Token extends Avid {
  get _name() {
    return 'tokens';
  }
}

class Car extends Avid {
  get _prefix() {
    return 'volvo';
  }

  get _version() {
    return 'v8';
  }

  get _name() {
    return 'cars';
  }
}

class Name extends Avid {
  get _name() {
    return 'names';
  }
}

class Version extends Avid {

  get _version() {
    return 'v6';
  }

}

class Suffix extends Avid {
  get _prefix() {
    return 'prefix';
  }
}

class Resource extends Avid {
  get _resource() {
    return 'foo/bar/baz';
  }
}
beforeEach(function () {
  Avid.baseUrl = 'http://framework.dev';
});

describe('Url Generation ', () => {
  it('should use the version and prefix set on the model ', () => {

    var user = new User;
    assert.equal('oauth/v2/user', user._resource);
  });

  it('should have no version by default ', () => {
    var awesome = new Awesomness();
    assert.equal('api/awesomness', awesome._resource)
  });

  it('should use the overwritten _name getter', () => {
    var token = new Token();
    assert.equal('tokens', token._name);
  });

  it('should use all overwritten getters to generate url ', () => {
    var car = new Car();
    assert.equal('volvo/v8/cars', car._resource);
  });

  it('should work when only overwriting _name ', () => {
    var name = new Name();
    assert.equal('api/names', name._resource);
  });

  it('should work when only overwriting _version ', () => {
    var version = new Version();
    assert.equal('api/v6/version', version._resource);
  });

  it('should work when only overwrting _prefix ', () => {
    var suffix = new Suffix();
    assert.equal('prefix/suffix', suffix._resource);
  });

  it('should work when overwiting _resource,', () => {
    var resource = new Resource();
    assert.equal('foo/bar/baz', resource._resource);
  });
});
