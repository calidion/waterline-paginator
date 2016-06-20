import assert from 'assert';
import waterlinePaginator from '../lib';
// import waterline from 'waterline';

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
      waterlinePaginator.paginate();
    } catch (e) {
      console.log(e);
      assert(e.message === 'Callback must not be null');

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
      catched = true;
    }
    assert(catched);
  });
});
