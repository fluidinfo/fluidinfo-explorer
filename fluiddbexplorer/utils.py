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
    'main': 'https://fluiddb.fluidinfo.com',
    'fluidinfo': 'https://fluiddb.fluidinfo.com',
    'fluiddb': 'https://fluiddb.fluidinfo.com',
    'sandbox': 'https://sandbox.fluidinfo.com',
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
