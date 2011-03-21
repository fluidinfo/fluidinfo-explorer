# -*- coding: utf-8 -*-
"""
    fluiddbexplorer
    ~~~~~~~~~~~~~~~

    :copyright: 2010 by Fluidinfo Explorer Authors
    :license: MIT, see LICENSE for more information
"""

import os
from flask import Flask, abort, redirect, render_template, request, \
                  session, url_for

from flaskext.extdirect import ExtDirect
from fluiddbexplorer import local_settings

app = Flask(__name__)
app.config.from_object(local_settings)
extdirect = ExtDirect(app)


from fluiddbexplorer import direct


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


def render_index(instance="main", username=None,
                 rootid='nstree-disabled', rootlabel='Fluidinfo', **kwargs):
    session['instance'] = instance

    if not username:
        username = session.get('username', 'Anonymous')

    return render_template("index.html",
                           username=username,
                           rootlabel=rootlabel,
                           instance=instance,
                           baseurl_instance=direct.get_instance_url(instance),
                           rootid=rootid,
                           **kwargs)


@app.route('/favicon.ico/')
def favicon():
    abort(404)


@app.route('/')
def index():
    username = session.get('username', 'Anonymous')
    if username == 'Anonymous':
        return redirect(url_for('splash', instance='main'))
    else:
        return redirect(url_for('main', instance='main', rootns=username))


@app.route('/<instance>/')
def splash(instance):
    username = session.get('username', 'Anonymous')
    if username != 'Anonymous':
        return redirect(url_for('main', instance=instance, rootns=username))
    else:
        return render_index(username=username, instance=instance)


@app.route('/<instance>/objects')
def openquery(instance):
    query = request.args.get('query', '')
    query = query.replace('"', '\\"')

    return render_index(instance=instance, autoopenquery=query)


@app.route('/<instance>/object/<objectid>')
@app.route('/<instance>/objects/<objectid>')
def openobjectid(instance, objectid):
    return render_index(instance=instance, autoopenobject=objectid)


@app.route('/<instance>/about/<about>')
def openabout(instance, about):
    return render_index(instance=instance, autoopenabout=about)


@app.route('/<instance>/<path:rootns>')
def main(instance, rootns):
    rootns = rootns.rstrip('/')
    return render_index(instance=instance, rootlabel=rootns, rootid=rootns)
