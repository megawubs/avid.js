import {expect, assert} from 'chai';
import {User} from "./models/user";
import {ModelProxy} from "../../source/proxyfy";

describe('Proxyfy ', () => {

    it('should give the propper type when using instanceof ', () => {

        let proxy = new ModelProxy(new User());

        assert.isTrue(proxy instanceof User);
    })

});