import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";
import {User} from "./models/user";

beforeEach(function () {
    Avid.baseUrl = 'http://localhost:3000';
});

describe('Model ', () => {

    it('should load all items from modelProxy with Model.all() ', () => {
        return User.all();
    });

    it('should get one item with Model.find(1) ', () => {
        return User.find(1);
    });

    it('should create a new model when model is newed up ', () => {
        let user = new User;
        user.name = 'Jan';
        user.email = 'jan@jan.com';
        user.password = 'secret';

        return user.save().then(user => {
            expect(user.id).to.be.a('number')
        });
    });

    it('should edit a model when model exists ', () => {
        return User.find(1).then(user => {
            user.name = 'Willem';
            return user.save();
        }).then(user => {
            assert.equal(user.id, 1);
            assert.equal(user.name, 'Willem');
        });
    });


    it('should use a different url for models when it is set ', () => {
        Avid.baseUrl = 'http://blaat.foo';
        assert.equal(User.baseUrl, 'http://blaat.foo');
        return User.find(1).catch(error => {
        });
    });

    it('should restore model when a update goes wrong ', () => {
        return User.find(1).then(user => {
            let oldName = user.name;
            Avid.baseUrl = 'http://blaat.foo';
            user.name = 'fooo2';
            user.save().then(() => {
                assert.equal(user.name, oldName);
            });
        });
    });

    it('should delete a model', () => {
        let user = new User();
        user.name = 'Bee';
        return user.save().then(user => {
            return user.delete();
        });
    });
});

