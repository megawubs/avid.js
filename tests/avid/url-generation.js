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

class NoPrefix extends Avid {

    get _name() {
        return 'no-prefix'
    }

    get _prefix() {
        return null;
    }

}
beforeEach(function () {
    Avid.baseUrl = 'http://localhost:3000';
});

describe('Url Generation ', () => {
    it('should use the version and prefix set on the model ', () => {

        let user = new User;
        assert.equal('oauth/v2/user', user._resource);
    });

    it('should have no version by default ', () => {
        let awesome = new Awesomness();
        assert.equal('api/awesomness', awesome._resource)
    });

    it('should use the overwritten _name getter', () => {
        let token = new Token();
        assert.equal('tokens', token._name);
    });

    it('should use all overwritten getters to generate url ', () => {
        let car = new Car();
        assert.equal('volvo/v8/cars', car._resource);
    });

    it('should work when only overwriting _name ', () => {
        let name = new Name();
        assert.equal('api/names', name._resource);
    });

    it('should work when only overwriting _version ', () => {
        let version = new Version();
        assert.equal('api/v6/version', version._resource);
    });

    it('should work when only overwrting _prefix ', () => {
        let suffix = new Suffix();
        assert.equal('prefix/suffix', suffix._resource);
    });

    it('should work when overwiting _resource,', () => {
        let resource = new Resource();
        assert.equal('foo/bar/baz', resource._resource);
    });

    it('should have no prefix when _prefix returns null', () => {
        let resource = new NoPrefix();
        assert.equal('no-prefix', resource._resource)
    })
});
