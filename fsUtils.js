var fs = require('fs'),
    path = require('path');

var Done = function(cb){
  this.num = 1;
  this.cb = cb;
  this.doOnce = function(inc){
    this.num += inc || 0;
    if(--this.num === 0){
      return this.cb();
    }
  }
}
/**
 * merge dirs into one, stuffs in dir1 will cover stuffs in dir2
 * @params src|string path of source
 * @params des|string path of des
 * @params cb|function callback
 */
exports.merge = function(src, des, cb){
  if(!cb){
    cb = function(){}
  }
  var cpError = null,
      done = new Done(cb);
  src = path.resolve(src);
  des = path.resolve(des);
  if(des.indexOf(src)===0){
    return cb(new Error("des cound not be subdir of src"));
  }
  fs.stat(src, function(err, stat){
    if(err&&err.code != 'ENOENT'){
      return cb(err);
    }
    _merge = function(src, des){
      fs.mkdir(des, function(err){
        if(err&&err.code !== 'EEXIST'){
          if(!cbError){
            cbError = err;
            return cb(err);
          }else{
            return;
          }
        }
        var files = fs.readdirSync(src),
            len = files.length;
        done.doOnce(len);
        for(var i=0; i!=len; ++i){
          (function(i){
            if(cpError) return;
            var srcPath = path.join(src,files[i]),
                desPath = path.join(des, files[i]),
                stat = fs.statSync(srcPath);
            if(stat.isDirectory()){
              _merge(srcPath, desPath);
            }else{
              fs.stat(desPath, function(err, stat){
                if((!err&&!stat.isDirectory()) || (err &&err.code === 'ENOENT')){
                  var readStream = fs.createReadStream(srcPath);              
                  var writeStream = fs.createWriteStream(desPath);
                  readStream.pipe(writeStream);
                }
                done.doOnce();
              })
            }
          })(i);
        }
      })  
    }
    _merge(src, des);
  })
}
