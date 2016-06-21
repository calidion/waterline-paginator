// var errors = require('../../config/errors');
// module.exports = {

//   },
//   paginateWithImages: function (cb, imageModel, linkKey, model, conditions, page, populates, limit, orders) {
//     if (!cb || !model) {
//       throw new AssertionError("Callback must not be null");
//     }
//     conditions = conditions ? conditions : {};
//     if (page < 0) {
//       page = 1;
//     }

//     limit = limit ? limit : sails.config.blueprints.defaultLimit;
//     var offset = (page - 1) * limit;
//     var i;

//     var query = model.find(conditions);
//     if (populates) {
//       for (i = 0; i < populates.length; i++) {
//         var populateItem = populates[i];
//         if (typeof populateItem === 'string') {
//           query.populate(populates[i]);
//         }
//         if (typeof populateItem === 'object') {
//           for (var key in populateItem) {
//             if (typeof key === 'string') {
//               query.populate(key, populateItem[key]);
//             }
//           }
//         }
//       }
//     }
//     if (orders) {
//       for (i = 0; i < orders.length; i++) {
//         query.sort(orders[i]);
//       }
//     }
//     query.limit(limit).skip(offset).exec(function (error, data) {
//       if (error) {
//         return cb(errors.DatabaseError);
//       }
//       model.count(conditions).exec(function (error, countValue) {
//         if (error) {
//           return cb(errors.DatabaseError);
//         }
//         if (!countValue) {
//           return cb(errors.Success, {
//             total: 0,
//             page: 0,
//             count: 0,
//             results: []
//           });
//         }
//         var total = parseInt(countValue / limit, 10);
//         if ((countValue % limit) !== 0) {
//           total++;
//         }
//         var idx = 0;

//         async.mapSeries(data, function (item, next) {
//           var imageconditions = {};
//           if (typeof linkKey === 'string') {
//             imageconditions[linkKey] = item.id;
//           } else {
//             if (!item[linkKey.item]) {
//               return next(null, data[idx++]);
//             }
//             imageconditions[linkKey.key] = item[linkKey.item].id;
//           }

//           imageModel.find(imageconditions).populate('image').sort('image desc').exec(function (error, image) {
//             if (error) {
//               console.error(error);
//             }
//             var images = [];
//             var sis = [];
//             if (image && image.length) {
//               for (i = 0; i < image.length; i++) {
//                 if (image[i].image) {
//                   sis.push(image[i].id);
//                   images.push(image[i].image.toJSON());
//                 }
//               }
//             }

//             data[idx].sis = sis;
//             data[idx].images = images;
//             next(null, data[idx++]);
//           });
//         }, function (err, results) {
//           if (!err) {
//             return cb(errors.Success, {
//               total: total,
//               count: countValue,
//               page: page,
//               results: results
//             });
//           }
//         });
//       });
//     });
//   }
// };

export default {
  _populate: function (query, populates) {
    if (populates) {
      for (var i = 0; i < populates.length; i++) {
        var populateItem = populates[i];
        if (typeof populateItem === 'string') {
          query.populate(populates[i]);
        }
        if (typeof populateItem === 'object') {
          for (var key in populateItem) {
            if (typeof key === 'string') {
              query.populate(key, populateItem[key]);
            }
          }
        }
      }
    }
  },
  _sort: function (query, orders) {
    if (orders) {
      for (var i = 0; i < orders.length; i++) {
        query.sort(orders[i]);
      }
    }
  },
  _count: function (model, conditions) {
    return model.count(conditions);
  },

  _onError: function (cb) {
    return function (reason) {
      cb(true, reason);
    };
  },

  paginate: function (data, cb) {
    if (!cb) {
      throw new Error("Callback must not be null");
    }
    if (!data) {
      throw new Error("data must not be null");
    }
    if (!data.model) {
      throw new Error("Model must not be null");
    }
    data.conditions = data.conditions ? data.conditions : {};
    var query = data.model.find(data.conditions);
    this._populate(query, data.populates);
    this._sort(query, data.sorts);
    if (!data.page || data.page <= 0) {
      data.page = 1;
    }
    var limit = data.limit ? data.limit : process.env.WATERLINE_PAGINATOR_LIMIT || 10;
    var offset = (data.page - 1) * limit || 0;
    var one = query.limit(limit).skip(offset);
    var all = this._count(data.model, data.conditions);

    Promise.all([one, all]).then(function (value) {
      var results = value[0];
      var countValue = value[1];
      if (countValue) {
        var total = parseInt(countValue / limit, 10);
        if ((countValue % limit) !== 0) {
          total++;
        }
        cb(false, {
          total: total,
          count: countValue,
          page: data.page,
          results: results
        });
      } else {
        cb(false, {
          total: 0,
          page: 0,
          count: 0,
          results: []
        });
      }
    }, this._onError(cb));
  }
};
