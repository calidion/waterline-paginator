
import assert from 'assert';
import waterlinePaginator from '../lib';
var bootstrap = require('./bootstrap');

module.exports = function (config) {
  var waterline;
  describe('waterline-paginator', function () {
    it('should be able to init waterline!', function (done) {
      bootstrap(config, function (error, ontology) {
        assert(!error);
        waterline = ontology;
        done();
      });
    });

    it('should be able to paginate!', function (done) {
      var options = {
        model: waterline.collections.area
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

    it('should be able to onPage!', function (done) {
      const func = waterlinePaginator._onPage(function () { }, function (error) {
        assert(error === true);
        done();
      });

      func(true, 'any');
    });

    it('should be able to paginate!', function (done) {
      var options = {
        model: waterline.collections.area
      };
      waterlinePaginator.page(options).then(function (data) {
        assert.deepEqual(data, {
          total: 0,
          page: 0,
          count: 0,
          results: []
        });
        done();
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
          model: waterline.collections.area
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
          var onPaginate = function (error, data) {
            assert(!error);
            assert(data.total > 0);
            assert(data.count > 0);
            assert(data.page > 0);
            assert(data.results.length > 0);
            done();
          };
          waterlinePaginator.paginate(options, onPaginate);
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
          assert(data.count === 2);
          assert(data.page === 1);
          assert(data.results.length > 1);
          assert(data.results[0].sis.length === 2);
          assert(data.results[0].images.length === 2);
          done();
        });
      });
    });
  });
};
