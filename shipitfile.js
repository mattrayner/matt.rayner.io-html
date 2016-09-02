module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            workspace: '/tmp/builds/matt.rayner.io',
            deployTo: '/var/www/matt.rayner.io',
            repositoryUrl: 'https://github.com/mattrayner/matt.rayner.io-html.git',
            ignores: ['.git', 'node_modules'],
            keepReleases: 3,
            deleteOnRollback: false,
            shallowClone: true
        },
        staging: {
            servers: 'deploy@matt.rayner.io'
        }
    });
};