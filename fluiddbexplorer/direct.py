# -*- coding: utf-8 -*-
"""
    fluiddbexplorer.direct
    ~~~~~~~~~~~~~~~~~~~~~~

    Ext.Direct functions

    :copyright: 2010 by Fluidinfo Explorer Authors
    :license: MIT, see LICENSE for more information
"""

from flask import Module, current_app, g, session
from fom.session import Fluid
from fom.db import PRIMITIVE_CONTENT_TYPE
from fom.errors import Fluid404Error

try:
    import json
    json  # make pyflakes happy
except ImportError:
    import simplejson as json

from flaskext.extdirect import ExtDirect

from fluiddbexplorer.utils import get_instance_url


direct = Module(__name__)
extdirect = ExtDirect(direct)


@direct.before_request
def setup_fluid():
    instance = session.get('instance', 'main')
    g.fluid = Fluid(get_instance_url(instance, ssl=False))


@extdirect.before_request
def setup_login():
    try:
        sess_username = session['username']
        sess_password = session['password']
        g.fluid.login(sess_username, sess_password)
    except KeyError:
        pass


@extdirect.register()
def NamespacesFetch(namespace):
    namespace = namespace.replace('ns-', '')
    path = namespace + '/'

    response = g.fluid.namespaces[namespace].get(returnNamespaces=True,
                                                 returnTags=True)

    out = []
    for nss in sorted(response.value['namespaceNames']):
        out.append({'id': 'ns-' + path + nss, 'leaf': False, 'text': nss})
    for tag in sorted(response.value['tagNames']):
        out.append({'id': 'tag-' + path + tag, 'leaf': True, 'text': tag})
    return out


@extdirect.register()
def Query(querystr):
    response = g.fluid.objects.get(querystr)
    ids = response.value['ids']

    out = []
    k = 0
    limit = current_app.config.get('QUERY_RESULTSET_LIMIT', None)
    limit_abouttag = current_app.config.get('QUERY_ABOUTTAG_LIMIT', None)
    showAbout = False if len(ids) > limit_abouttag else True

    for objid in ids:

        if k == limit:
            break
        k = k + 1

        if showAbout:
            try:
                about = g.fluid.objects[objid]['fluiddb/about'].get().value
                type = 'primitive'
            except:
                about = 'no about tag'
                type = 'empty'
        else:
            about = ''
            type = 'notfetch'
        out.append({'oid': objid, 'about': about, 'type': type})

    return {'ids': out}


@extdirect.register()
def TagValuesFetch(oid):
    response = g.fluid.objects[oid].get()
    out = []
    tags = response.value['tagPaths']
    showTagValue = False if len(tags) > 10 else True

    for tag in tags:
        readonly = True

        if showTagValue:
            try:
                tagresponse = g.fluid.objects[oid][tag].get()
                if tagresponse.content_type.startswith(PRIMITIVE_CONTENT_TYPE):
                    if isinstance(tagresponse.value, list):
                        value = json.dumps(tagresponse.value)
                        type = 'primitivelist'
                    else:
                        value = unicode(tagresponse.value)
                        type = 'primitive'
                    readonly = False
                else:
                    value = '(Opaque value)'
                    type = 'opaque'
            except:
                value = '...request error...'
                type = 'error'
        else:
            value = ''
            type = 'notfetch'

        ns = tag.split("/")[0]
        out.append({'ns': ns,
                    'tag': tag,
                    'value': value,
                    'readonly': readonly,
                    'type': type})

    return {'tags': out}


@extdirect.register()
def GetTagValue(oid, tag):
    readonly = True

    try:
        tagresponse = g.fluid.objects[oid][tag].get()
    except Fluid404Error:
        return {'type': 'error', 'value': ''}

    if tagresponse.content_type.startswith(PRIMITIVE_CONTENT_TYPE):
        if tagresponse.value is None:
            type = 'empty'
            value = 'Empty'
            readonly = False
        else:
            if isinstance(tagresponse.value, list):
                type = 'primitivelist'
                value = json.dumps(tagresponse.value)
            else:
                type = 'primitive'
                value = unicode(tagresponse.value)
            readonly = False
    else:
        type = 'opaque'
        value = tagresponse.content_type

    return {'type': type, 'value': value, 'readonly': readonly}


@extdirect.register()
def TagObject(oid, tag, value):
    g.fluid.objects[oid][tag].put(value)


@extdirect.register(flags={'formHandler': True})
def TagObjectForm(oid, tag, value, type):
    if type == 'int':
        value = int(value)
    elif type == 'float':
        value = float(value)
    elif type == 'bool':
        value = False if value == '0' else True
    elif type == 'none':
        value = None
    elif type == 'list':
        value = json.loads(value)

    g.fluid.objects[oid][tag].put(value)
    return {'success': True}


@extdirect.register()
def DeleteTagValue(oid, tag):
    g.fluid.objects[oid][tag].delete()


@extdirect.register()
def CreateNamespace(path, namespace, description):
    g.fluid.namespaces[path].post(namespace, description)


@extdirect.register()
def DeleteNamespace(namespace):
    g.fluid.namespaces[namespace].delete()


@extdirect.register()
def CreateTag(path, tag, description):
    g.fluid.tags[path].post(tag, description, False)


@extdirect.register()
def DeleteTag(tag):
    g.fluid.tags[tag].delete()


@extdirect.register()
def GetPerm(type, action, path):
    if type == 'ns':
        response = g.fluid.permissions.namespaces[path].get(action).value
    else:
        response = g.fluid.permissions.tag_values[path].get(action).value
    return response


@extdirect.register()
def SetPerm(type, action, path, policy, exceptions):
    if type == 'ns':
        g.fluid.permissions.namespaces[path].put(action,
                                               policy,
                                               exceptions)
    else:
        g.fluid.permissions.tag_values[path].put(action,
                                               policy,
                                               exceptions)


@extdirect.register()
def AboutToID(about):
    return g.fluid.about[about].get().value['id']


@extdirect.register()
def CreateObject(about):
    if about == "":
        about = None
    response = g.fluid.objects.post(about)
    return response.value['id']


@extdirect.register(flags={'formHandler': True})
def Login(username, password):
    instance = session.get('instance', 'fluiddb')
    flogin = Fluid(get_instance_url(instance, ssl=False))
    flogin.login(username, password)

    try:
        flogin.namespaces[username].get()

        session['logged'] = True
        session['username'] = username
        session['password'] = password
        return {'success': True}

    except:
        return {'success': False}


@extdirect.register()
def Logout():
    session.pop('logged', None)
    session.pop('username', None)
    session.pop('password', None)
