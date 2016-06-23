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

  it('should be able to paginate!', function (done) {
    models(function (error, ontology) {
      waterline = ontology;
      var options = {
        model: ontology.collections.area
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
    var area = waterline.collections.area;
    area.create([
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
        model: area
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
      console.error(error);
      done();
    });
  });

  it('should be able to paginate with populates!', function (done) {
    var area = waterline.collections.area;
    var logo = waterline.collections.logo;
    logo.create({
      hash: 'sdf',
      url: 'sdfsdf'
    }).then(function (anImage) {
      area.create([
        {
          name: '1',
          type: '1',
          logo: anImage.id
        }, {
          name: '2',
          type: '2',
          logo: anImage.id
        }, {
          name: '3',
          type: '3'
        }
      ]).then(function (results) {
        return Promise.resolve(results);
      }).then(function () {
        var options = {
          model: area,
          populates: [
            'logo'
          ]
        };
        waterlinePaginator.paginate(options, function (error, data) {
          assert(!error);
          assert(data.total > 0);
          assert(data.count > 0);
          assert(data.page > 0);
          assert(data.results.length > 0);
          done();
        });
      }).fail(function (error) {
        console.error(error);
        done();
      });
    }).fail(function (error) {
      console.error(error);
      done();
    });
  });

  it('should be able to paginate with populates and images!', function (done) {
    var area = waterline.collections.area;
    var image = waterline.collections.image;
    var areaimage = waterline.collections.areaimage;
    var userarea = waterline.collections.userarea;

    var anImage;
    var anArea;
    // var anAreaImage;
    // var anUserArea;

    Promise.all([image.create([
      {
        hash: 'sdf',
        url: 'sdfsdf'
      }, {
        hash: 'sdf',
        url: 'sdfsdf'
      }
    ]), area.create([
      {
        name: '3',
        type: '3'
      }, {
        name: '1',
        type: '1'
      }
    ])
    ]).then(function (data) {
      anImage = data[0];
      anArea = data[1];
      return Promise.all([areaimage.create([
        {
          area: anArea[0].id,
          image: anImage[0].id
        }, {
          area: anArea[0].id,
          image: anImage[1].id
        }]), userarea.create([
          {
            name: 'sodfsdf0',
            area: anArea[0].id
          }, {
            name: 'sodfsdf1',
            area: anArea[0].id
          }
        ])]).then(function () {
          return Promise.resolve(0);
        }, function (error) {
          console.error(error);
        });
    }).then(function () {
      var options = {
        model: userarea,
        imageModel: areaimage,
        populates: ['area'],
        linkKey: {
          key: 'area',
          item: 'area'
        }
      };
      waterlinePaginator.paginate(options, function (error, data) {
        assert(!error);
        assert(data.total === 1);
        assert(data.count === 4);
        assert(data.page === 1);
        assert(data.results.length > 1);
        assert(data.results[0].sis.length === 2);
        assert(data.results[0].images.length === 2);
        done();
      });
    });
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
