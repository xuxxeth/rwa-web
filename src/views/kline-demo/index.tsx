
// import styles from "./kline.module.less";
import './kline.less'

function KLineDemo() {
  return (
    <div className="demowrap">
      <header>
        <a id="site-logo" href="#">TradingVista</a>
        <input type="search" placeholder="Search..." />
      </header>
      <nav id="ticker-tape">Ticker Tape</nav>
      <main>
          <section id="symbol-info">Symbol Info</section>
          <section id="advanced-chart">Advanced Chart</section>
          <section id="company-profile">Company Profile</section>
          <section id="fundamental-data">Fundamental Data</section>
          <section id="technical-analysis">Technical Analysis</section>
          <section id="top-stories">Top Stories</section>
          <section id="powered-by-tv">
          </section>
      </main>
      <footer>
      </footer>
    </div>
  )
}

export default KLineDemo