# -*- coding: utf-8 -*-
"""
    fluiddbexplorer.utils
    ~~~~~~~~~~~~~~~~~~~~~

    Utility functions

    :copyright: 2010 by Fluidinfo Explorer Authors
    :license: MIT, see LICENSE for more information
"""

import os
from flask import current_app, url_for


INSTANCE_URLS = {
    'main': 'http://fluiddb.fluidinfo.com',
    'fluidinfo': 'http://fluiddb.fluidinfo.com',
    'fluiddb': 'http://fluiddb.fluidinfo.com',
    'sandbox': 'http://sandbox.fluidinfo.com',
}


def get_instance_url(instance):
    try:
        url = INSTANCE_URLS[instance]
    except KeyError:
        url = 'http://' + instance
    return url


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(current_app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)
