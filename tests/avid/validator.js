import {expect, assert} from 'chai';
import {Avid} from "../../source/avid";
import {Home} from "./models/home";
let axios = require('axios');
let madeRequest = false;
axios.interceptors.request.use(config => {
    madeRequest = true;
    return config
}, error => {
    return Promise.reject(error);
});

class Post extends Avid {
    constructor() {
        return super();
    }

    get _rules() {
        return {
            content: {
                presence: true,
            },
            group_id: {
                presence: true
            }
        }
    }
}


beforeEach(function () {
    madeRequest = false;
    Avid.baseUrl = 'http://localhost:3000';
});

describe('Validation ', () => {
    it("should fail when required properties are not set ", () => {
        let post = new Post();
        post.not_relevant = 'blaat';
        return post.save().catch(error => {
            assert.equal(madeRequest, false);
        })
    });

    it('should make a request when all required properties are set ', () => {
        let post = new Post();
        post.group_id = 1;
        post.content = "bladialbadilbaaat";
        post.save().then(success => {
            assert.equal(madeRequest, true);
        })
    });

    it('should make a request when there are no validation rules ', () => {
        let home = new Home();
        home.name = "fooo";
        return home.save().then(success => {
            assert.equal(madeRequest, true);
        })
    });
});