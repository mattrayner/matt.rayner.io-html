module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            workspace: '/tmp/builds/matt.rayner.io',
            deployTo: '/var/www/matt.rayner.io',
            repositoryUrl: 'https://github.com/mattrayner/matt.rayner.io-html.git',
            ignores: ['.git', 'node_modules'],
            keepReleases: 2,
            deleteOnRollback: false,
            shallowClone: true
        },
        live: {
            servers: 'deploy@matt.rayner.io'
        }
    });

    shipit.on('deploy', function(){
        shipit.start('gulp build:'+shipit.environment)
    })
};