import tsindex
import logging

logging.basicConfig(level=logging.DEBUG)
from flask import Flask, url_for, escape, request, make_response
app = Flask(__name__)


@app.route("/")
def data():
    logging.info(request.args)
    start = request.args.get('start', '2000-01-01')
    end = request.args.get('end', '2001-01-01')
    selection = tsindex.subset(app.levels, start, end)
    txt = tsindex.subset2txt(selection)
    resp = make_response(txt, 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == "__main__":
    # this can be done on import
    logging.debug('loading data')
    timeseries = tsindex.load_timeseries()
    logging.debug('data loaded')
    levels = tsindex.make_levels(timeseries)
    app.levels = levels
    app.run()
