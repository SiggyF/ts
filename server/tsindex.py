# coding: utf-8
import datetime
import json

import netCDF4
import pandas
import numpy as np
import dateutil.parser


def load_timeseries(filename='data/id1-DELFZL.nc'):
    """load a station series from netCDF"""
    ds = netCDF4.Dataset(filename)
    dates = netCDF4.num2date(
        ds.variables['time'][:],
        ds.variables['time'].units
    )
    # convert to integer value representing the number of
    # milliseconds since 1 January 1970 00:00:00 UTC
    h = ds.variables['sea_surface_height'][0, :]
    ds.close()
    ts = pandas.TimeSeries(data=h, index=dates)
    return ts


def make_levels(timeseries):
    """create a time based index"""
    # resample timeseries into 10 minutes, hours days, seconds, minutes, using mean and padding
    levels = {}
    levels['r'] = timeseries.dropna()
    levels['m'] = timeseries.resample('600s', how='mean',
                                      label='left', convention='s',
                                      fill_method='pad')
    levels['H'] = timeseries.resample('H', how='mean',
                                      convention='s', fill_method='pad')
    levels['D'] = timeseries.resample('D', how='mean',
                                      convention='s', fill_method='pad')
    levels['M'] = timeseries.resample('M', how='mean',
                                      label='left', loffset='1d')
    levels['A'] = timeseries.resample('A', how='mean',
                                      label='left', loffset='1d')
    return levels


def choose_level(start, end):
    """choose a level based on a timespan"""
    timediff = end - start
    seconds = timediff.total_seconds()
    seconds *= 0.3
    if seconds > 60 * 60 * 24 * 365 * 10:
        # decades, return annual data
        return 'A'
    elif seconds > 60 * 60 * 24 * 365:
        # years return monthly data
        return 'M'
    elif seconds > 60 * 60 * 24 * 31:
        # months, return daily data
        return 'D'
    elif seconds > 60 * 60 * 24:
        # days, return minutes
        return 'm'
    # or return raw data
    return 'r'


def subset(levels, start, end):
    """subset the levels by a time interval"""
    start = dateutil.parser.parse(start)
    end = dateutil.parser.parse(end)
    level_key = choose_level(start, end)
    level = levels[level_key]
    idx = np.logical_and(level.index >= start, level.index < end )
    return level.ix[idx]


def subset2txt(timeseries):
    """convert timeseries to json compatbile format"""
    # convert to json compatbile format
    data = [
        {"t":t.value/1e6, "h": float(h)}
         for t, h
         in timeseries.iteritems()
    ]
    txt = json.dumps(data)
    return txt

