const elixir = require('laravel-elixir');


elixir(mix => {
    mix.webpack(['./tests/avid/**/*.js'], 'tests/server/tests-bundle.js')
        .webpack(['./tests/bootstrap.js'], 'tests/server/bootstrap.js')
        .copy(['node_modules/mocha/mocha.js'], 'tests/server/mocha.js')
        .webpack('./source/**/*.js', 'dist/avid.js')
});
