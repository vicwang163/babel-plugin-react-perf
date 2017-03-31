'use strict';

module.exports = function (Perf, config) {
  Perf.start();
  setTimeout(function () {
    Perf.stop();
    var lastMeasurements = Perf.getLastMeasurements();
    var wastedReport = Perf.getWasted(lastMeasurements);
    if (wastedReport && wastedReport.length) {
      console.info('%c react-Perf: wasted report', 'color:red;font-size:20px');
      console.table(wastedReport);
    }
    if (Perf.getInclusive) {
      var inclusivedReport = Perf.getInclusive(lastMeasurements);
      var maxExecuteLimit = config.maxExecuteLimit ? config.maxExecuteLimit : 5;
      inclusivedReport = inclusivedReport.filter(function (item) {
        return item.inclusiveRenderDuration > maxExecuteLimit;
      });
      if (inclusivedReport && inclusivedReport.length) {
        console.info('%c react-Perf: inclusive report (maxExecuteLimit = ' + maxExecuteLimit + 'ms)', 'color:red;font-size:20px');
        console.table(inclusivedReport);
      }
    } else {
      Perf.printInclusive(lastMeasurements);
    }
  }, 200);
};