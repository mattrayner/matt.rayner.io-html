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
            servers: 'deploy@matt.rayner.io',
            env: 'live'
        }
    });

    shipit.task('grunt', function(){
        return shipit.remote('grunt build:'+shipit.environment)
    });

    shipit.on('deploy:update', function(){
        shipit.run('grunt')
    })
};