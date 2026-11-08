// one JSON line per event, same shape as the kk-payments app
module.exports = function log(level, msg, fields) {
  console.log(JSON.stringify(Object.assign({
    time: new Date().toISOString(), level, msg
  }, fields)));
};