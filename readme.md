# process-log
A logger "inspired" by [npmlog] supporting a wider range of colors for styling.

## Installing
Via [npm]:
```
$ npm i process-log --save
```

## Usage
Use it like any other logger:
```javascript
var log = require('process-log');
log.level = 'silly';  // shows all messages
log.info('bar', '%s: qux', 'baz');
// → info bar baz: qux
```

The first argument is an optional *prefix* that will be styled according to the `prefix` styles. It can be omitted by passing `false` or `null`:
```javascript
log.info(false, '%s: qux', 'baz');
// → info baz: qux
```

You can define a heading for each line:
```javascript
log.heading = 'foo';
log.info('bar', '%s: qux', 'baz');
// → foo info bar baz: qux
```

If `process.name` is set to a string then it will be used as the default heading.

Styles can be changed with `log.setStyle(level, style)`, either named colors or a hex-values in the format `#nnnnnn` can be used:
```javascript
// make the label for silly messages white with
// terrible pink background
log.setStyle('silly', {fg: 'white', bg: '#ff27ca'});
```

Or you can redefine the lot:
```javascript
log.reset();
log.addLevel('ok', 1000, { fg: '#82b375', bg: 'black' });
log.addLevel('scary', 2000, { fg: '#e3e782', bg: 'black' });
log.addLevel('panic', 3000, { fg: 'black', bg: '#cc6666' }, 'AARRGH');
// show all
log.level = 'ok';

log.panic('foo', 'bar');
// → AARRGH foo bar
```

The level `silent` is always available, and the default after a `log.reset()`.

##Releases
###0.0.1
* Initial release.

##Future
* Alternate formatter (currently using `util.format`)
* Support for being exported as a [winston] transport.

[npmlog]: https://github.com/npm/npmlog "The logger that npm uses"
[npm]: https://www.npmjs.org/
[winston]: https://github.com/flatiron/winston
