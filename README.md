Fluidinfo Explorer
==================

(c) 2011 Fluidinfo Explorer Authors (as specified in AUTHORS file)

License: MIT License

What is the Fluidinfo Explorer
------------------------------

With this tool you can navigate into [Fluidinfo](http://www.fluidinfo.com)
using either the namespace tree or by doing queries.

Setup
-----

1. Get the source: bzr branch lp:fluidinfo-explorer
2. Copy fluiddbexplorer/local_settings.py-dist to fluiddbexplorer/local_settings.py
3. Turn on debug in the local_settings.py file (e.g.: DEBUG = True)
4. Put the URL into BASE_URL parameter (e.g.: http://192.168.0.100:5000)
5. run the application: python runserver.py

How it's built
--------------

The Fluidinfo Explorer uses these:

* [Fluidinfo](http://www.fluidinfo.com)
* [FOM](https://launchpad.net/fom)
* [ExtJS](http://www.extjs.com)
* [Flask](http://flask.pocoo.org)
* [Gunicorn](http://gunicorn.org)
* [nginx](http://nginx.org)
