module.exports = function(Perf, config) {
  Perf.start()
  setTimeout(function () {
    Perf.stop()
    let lastMeasurements = Perf.getLastMeasurements()
    let wastedReport = Perf.getWasted(lastMeasurements)
    if (wastedReport && wastedReport.length) {
      console.info('%c react-Perf: wasted report', 'color:red;font-size:20px')
      console.table(wastedReport)
    }
    if (Perf.getInclusive) {
      let inclusivedReport = Perf.getInclusive(lastMeasurements)
      let maxExecuteLimit = config.maxExecuteLimit ? config.maxExecuteLimit : 5
      inclusivedReport = inclusivedReport.filter((item) => {
        return item.inclusiveRenderDuration > maxExecuteLimit
      })
      if (inclusivedReport && inclusivedReport.length) {
        console.info(`%c react-Perf: inclusive report (maxExecuteLimit = ${maxExecuteLimit}ms)`, 'color:red;font-size:20px')
        console.table(inclusivedReport)
      }
    } else {
      Perf.printInclusive(lastMeasurements)
    }
  }, 200)
}