# waterline-paginator [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> paginator for waterline models

## Installation

```sh
$ npm install --save waterline-paginator
```

## Usage

```js
var waterlinePaginator = require('waterline-paginator');

var User = {
  connection: 'default',
  identity: 'user',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    name: 'string',
    type: 'string',
    logo: {
      model: 'image'
    }
  }
};

var image = {
  connection: 'default',
  identity: 'image',
  schema: true,
  tableName: 'area',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    hash: 'string',
    url: 'string'
  }
};

var options = {
  model: User,
  conditions: {
    name: 'eric',
    type: 'employee'
  },
  page: 1,
  limit: 10,
  sorts: ['id asc', 'name desc'],
  populates: [
    'logo'
  ]
};
waterlinePaginator.paginate(options, function (error, paginatedList) {
  // paginatedList is what you will get
});
```

<code>paginatedList</code> is what you will get as the paginated result.

## License

Apache-2.0 © [calidion](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/waterline-paginator.svg
[npm-url]: https://npmjs.org/package/waterline-paginator
[travis-image]: https://travis-ci.org/calidion/waterline-paginator.svg?branch=master
[travis-url]: https://travis-ci.org/calidion/waterline-paginator
[daviddm-image]: https://david-dm.org/calidion/waterline-paginator.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/calidion/waterline-paginator
[coveralls-image]: https://coveralls.io/repos/calidion/waterline-paginator/badge.svg
[coveralls-url]: https://coveralls.io/r/calidion/waterline-paginator
