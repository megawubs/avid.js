import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";


class User extends Avid {
  get version() {
    return 'v2';
  }

  get prefix() {
    return 'oauth'
  }
}

class Awesomness extends Avid {

}

beforeEach(function () {
  Avid.baseUrl = 'http://localhost:8000';
});
describe('Versions ', () => {
  it('should use the version set on the model ', () => {

    var user = new User;
    assert.equal('v2/user', user.resource);
  });

  it('should use the prefix set on the model ', () => {
    var user = new User;
    assert.equal('oauth', user.prefix);
  });

  it('should have no version by default ', () => {
    var awesome = new Awesomness();
    assert.equal('awesomness', awesome.resource)
  })
});
