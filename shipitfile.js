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

    shipit.blTask('npm:install', function(){
        shipit.log('Attempting npm:install');
        return shipit.remote('cd '+shipit.releasePath+' && npm install && npm install gulp-cli && sleep 3');
    });

    shipit.blTask('gulp', ['npm:install'], function(){
        shipit.log('Attempting grunt:build');
        return shipit.remote('cd '+shipit.releasePath+' && gulp build:live && sleep 1 && gulp critical && sleep 1 && gulp sitemap && sleep 1');
    });

    shipit.on('updated', function(){
        return shipit.start('gulp');
    });
};