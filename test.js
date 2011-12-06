var fsUtils = require('./fsUtils');

fsUtils.merge('d1', 'd2', function(err){
  if(err){
    console.log(err.toString());
  }
  else{
    console.log('done');
  }
})
