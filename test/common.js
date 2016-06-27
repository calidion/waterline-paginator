import assert from 'assert';
import waterlinePaginator from '../lib';

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
      console.error(e);
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
      console.error(e);
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
      console.error(e);
      assert(e.message === 'Callback must not be null');
      catched = true;
    }
    assert(catched);
  });

  // it("should go with _onAsyncImageEnd", function (done) {
  //   var func = waterlinePaginator._onAsyncImageEnd(null, function (error) {
  //     assert(error);
  //     done();
  //   });
  //   func(true);
  // });

  it("should go with _onFetchImage", function (done) {
    var func = waterlinePaginator._onFetchImage([{}, {}, {}], 0, function (error, data) {
      assert(!error);
      assert(data.sis.length === 0);
      assert(data.images.length === 0);
      done();
    });
    func(true);
  });

  it("should go with _getImageCondition", function () {
    var conditions = waterlinePaginator._getImageCondition(
      {
        linkKey: 'hello'
      }, null, {
        id: 1
      }, 0);
    assert(conditions.hello === 1);
  });

  it("should go with _getImageCondition 2", function (done) {
    waterlinePaginator._getImageCondition(
      {
        linkKey: {
        }
      }, [1, 2, 3, 4], {
        id: 1
      }, 0, function (error, data) {
        assert(error === null);
        assert(data === 1);
        done();
      });
  });
});
