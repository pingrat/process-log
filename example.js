
var log = require('./log.js');

function doit() {
	log.silly('silly prefix', 'x:number = %j', 42)
	log.verbose('verbose prefix', 'x:string = %j', 'foo = bar')
	log.info('info prefix', 'x:array = %j', [1, 2, 3, 4, 5])
	log.http('http prefix', 'x:object = %j', {foo:{bar:'baz'}})
	log.warn('warn prefix', 'x:boolean = %j', false);
	log.error('error prefix', 'x:null = %j', null);
	log.silent('silent prefix', 'x = %j', {foo:{bar:'baz'}});
}

console.error('log.level="info"');
log.level = 'info';
doit();

console.error('log.level="silent"');
log.level = 'silent';
doit();

console.error('log.level="silly"');
log.level = 'silly';
doit();

console.error('log.heading="myapp"');
log.heading = 'myapp';
doit();

console.error('multi-line message')
log.error('404', ['This is a longer',
'message, with some details',
'and maybe a stack.',
new Error('a 404 error').stack].join('\n'))

console.error('restyling')
log.setStyle('silly', {fg: 'white', bg: '#ff27ca'});
log.silly('silly prefix', 'pink is silly')
