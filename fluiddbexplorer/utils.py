# -*- coding: utf-8 -*-
"""
    fluiddbexplorer.utils
    ~~~~~~~~~~~~~~~~~~~~~

    Utility functions

    :copyright: 2010 by Fluidinfo Explorer Authors
    :license: MIT, see LICENSE for more information
"""

import os
from flask import request, current_app, url_for


INSTANCE_URLS = {
    'main': 'fluiddb.fluidinfo.com',
    'fluidinfo': 'fluiddb.fluidinfo.com',
    'fluiddb': 'fluiddb.fluidinfo.com',
    'sandbox': 'sandbox.fluidinfo.com',
}


def get_instance_url(instance, ssl=None):
    url = INSTANCE_URLS.get(instance, instance)

    if ssl == None:
        ssl = True if request.environ.get('HTTP_X_FORWARDED_SSL', '') == 'on' else False

    if ssl == True:
        return 'https://' + url
    else:
        return 'http://' + url


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(current_app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)
