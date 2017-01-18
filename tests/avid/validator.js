import {expect, assert} from "chai";
import {Avid} from "../../source/avid";
import {User} from "./models/user";
let validate = require('validate.js');
let axios = require('axios');
let madeRequest = false;
axios.interceptors.request.use(config => {
    madeRequest = true;
    return config
}, error => {
    return Promise.reject(error);
});

class Home extends Avid {

    get _version() {
        return 'v1'
    }

    get _actionsValidator() {
        return new HomeValidator();
    }

    rentTo(user, amount) {
        return this.interactsWith('rent-to', {user: user, amount: amount});
    }

    changeOwner(user) {
        return this.interactsWith('change-owner', {newOwner: user});
    }
}

class HomeValidator {

    rentTo(attributes) {
        console.info('validating Home.rentTo');
        return validate(attributes, {
            user: {
                presence: true,
                numericality: true
            },
            amount: {
                presence: true,
                numericality: true
            }
        })
    }
}

describe('Validator ', () => {
    it('should validate when all attributes are correct ', () => {
        let validator = new HomeValidator();
        let result = validator.rentTo({user: 1, amount: 650});
        assert.isUndefined(result);
    });

    it('should fail the validator when executing the action on the model with wrong values ', () => {
        let home = Home.find(1);
        let user = User.find(1);

        return Promise.all([home, user])
            .then(both => {
                madeRequest = false;
                let [home, user] = both;

                return home.rentTo(user, 650)
                    .then(response => {
                        //this should not run
                    }).catch(error => {
                        assert.equal(madeRequest, false);
                        assert.property(error, 'user');
                    });
            });
    });

    it('should success the validator when executing the action on the model with correct values ', () => {
        let home = Home.find(1);
        let user = User.find(1);

        return Promise.all([home, user])
            .then(both => {
                madeRequest = false;
                let [home, user] = both;

                home.rentTo(user.id, 650).then(error => {
                    assert.equal(madeRequest, true);
                });
            });
    });

    it('should work when no action validator is present on the validator ', () => {
        let home = Home.find(1);
        let user = User.find(1);

        return Promise.all([home, user])
            .then(both => {
                madeRequest = false;
                let [home, user] = both;

                home.changeOwner(user.id).then(() => {
                    assert.equal(madeRequest, true);
                });
            });
    })
});