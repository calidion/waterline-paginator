import assert from 'assert';
import waterlinePaginator from '../lib';
// import waterline from 'waterline';

var models = require('./models');
var waterline;

describe('waterline-paginator', function () {
  it('should be able to populate!', function () {
    var data = [];
    var query = {
      populate: function (key, extra) {
        if (typeof extra === 'object') {
          var tmp = {};
          tmp[key] = extra;
          data.push(tmp);
        } else {
          data.push(key);
        }
      }
    };
    var populates = [
      'store',
      {
        user: {
          online: true
        }
      }
    ];
    waterlinePaginator._populate(query, populates);
    assert.deepEqual(data, populates);
  });

  it('should be able to sort (order by)!', function () {
    var data = [];
    var query = {
      sort: function (order) {
        data.push(order);
      }
    };
    var orders = [
      'id desc',
      'name asc'
    ];
    waterlinePaginator._sort(query, orders);
    assert.deepEqual(data, orders);
  });

  it('should be able to count!', function () {
    var data;
    var query = {
      count: function (extra) {
        data = extra;
      }
    };
    var conditions = {
      id: '> 1',
      name: '= 10'
    };
    waterlinePaginator._count(query, conditions);
    assert.deepEqual(data, conditions);
  });

  it('should be able to handle error!', function (done) {
    var myError = {
      message: 'query error'
    };
    var func = waterlinePaginator._onError(function (error, data) {
      assert(error);
      assert.deepEqual(data, myError);
      done();
    });
    func(myError);
  });

  it('should not be able to paginate!', function () {
    var catched = false;
    try {
      waterlinePaginator.paginate({
      }, function () {
      });
    } catch (e) {
      console.log(e);
      assert(e.message === 'Model must not be null');
      catched = true;
    }
    assert(catched);
  });

  it('should not be able to paginate!', function () {
    var catched = false;
    try {
      waterlinePaginator.paginate(null, function () {
      });
    } catch (e) {
      console.log(e);
      assert(e.message === 'data must not be null');
      catched = true;
    }
    assert(catched);
  });

  it('should not be able to paginate!', function () {
    var catched = false;
    try {
      waterlinePaginator.paginate();
    } catch (e) {
      console.log(e);
      assert(e.message === 'Callback must not be null');
      catched = true;
    }
    assert(catched);
  });

  it('should be able to paginate!', function (done) {
    models(function (error, ontology) {
      waterline = ontology;
      var options = {
        model: ontology.collections.model
      };
      waterlinePaginator.paginate(options, function (error, data) {
        assert(!error);
        assert.deepEqual(data, {
          total: 0,
          page: 0,
          count: 0,
          results: []
        });
        done();
      });
    });
  });

  it('should be able to paginate!', function (done) {
    var model = waterline.collections.model;
    model.create([
      {
        name: '1',
        type: '1'
      }, {
        name: '2',
        type: '2'
      }, {
        name: '3',
        type: '3'
      }, {
        name: '1',
        type: '1'
      },
      {
        name: '1',
        type: '1'
      }
    ]).then(function (results) {
      return Promise.resolve(results);
    }).then(function () {
      var options = {
        model: model
      };
      waterlinePaginator.paginate(options, function (error, data) {
        assert(!error);
        assert.deepEqual(data, {
          total: 1,
          count: 5,
          page: 1,
          results:
          [
            {
              name: '1',
              type: '1',
              id: 1
            },
            {
              name: '2',
              type: '2',
              id: 2
            },
            {
              name: '3',
              type: '3',
              id: 3
            },
            {
              name: '1',
              type: '1',
              id: 4
            },
            {
              name: '1',
              type: '1',
              id: 5
            }
          ]
        });
        done();
      });
    }).fail(function (error) {
      console.log(error);
      done();
    });
  });
});
