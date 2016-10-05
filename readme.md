Eloquentjs
==========
An active record like approach to consuming an API, inspired by Laravel's Eloquent

### Installation
For now, this module only works inside a laravel installation.

```Shell
$ npm install @megawubs/eloquentjs --save
```

### Usage

This wrapper expects a certain api design. The name of the model you create is automatically mapped to an api endpoint.
Let's say we have a `User` model, by default Eloquentjs will generate a resource uri of `/api/v1/user`. When you 

```JavaScript
export class User extends Eloquent{
    get version(){
        return 'v1'
    }

    posts(){
        return this.hasMany(Post, 'posts');
    }
}

export class Post extends Eloquent{
    get version(){
        return 'v1'
    }

    user(){
        return this.belongsTo(User);
    }
}

User.find(1) //model fetched from api
.then(user => user.posts) //fetch relations from api
.then(posts => console.log(posts)); //log relations

Post.find(1) //model fetched from api
.then(post => post.user) //fetch relation from api
.then(post => console.log(post)); //log relation

 var user = new User(); //new up a user

user.name = 'John'
user.email = 'do@john.com'
user.email = 'secret'
 user.save()
 .then(user => console.log(user.id)); //1 (saved user through the API)

 User.find(1).then(user => {
 user.name = 'jane'
 user.email = 'do@jane.com'
 return user.save();
 }).then(updatedUser => console.log(updatedUser.name)); //jane
```
