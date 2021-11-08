# Matt Rayner Flat HTML Site

### Pug templating

All templates inherit from the base template (`app/pug/base.pug`), which includes things like the title, footer etc.

To add a new template, simply create a new `.pug` file in the `app/pug` folder, and mention it in the Gruntfile (so the template is automatically converted on pug/watch/build tasks).
