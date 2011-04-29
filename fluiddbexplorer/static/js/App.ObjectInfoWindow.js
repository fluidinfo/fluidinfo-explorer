App.ObjectInfoWindow = Ext.extend(Ext.Window, {
	title: 'Object information'
	,border: false
	,width: 520
	,height: 200
	,layout: 'fit'
	,initComponent: function(){
		this.items = [{
			border: true
			,margins: "3 3 3 3"
			,frame: true
			,layout: 'fit'
			,bodyStyle: 'padding:2px;'
			,html: "Object ID: " + this.oid
		}];
		this.buttons = [
			{text: 'OK', handler: function(){this.close();}, scope: this}
		]
		App.ObjectInfoWindow.superclass.initComponent.call(this);
	}
	,afterRender: function(){
		App.ObjectInfoWindow.superclass.afterRender.apply(this, arguments);

		var win = this;

		direct.GetTagValue(this.oid, "fluiddb/about", function(json){
			value = json.value;
			if (value.match(/^https?:\/\//)) {
				value = '<a href="' + value + '" target="_blank">' + value + '</a>';
			}
			objurl = '<a href="' + App.Config.baseurl_instance + "/objects/" + win.oid + '" target="_blank">' + App.Config.baseurl_instance + "/objects/" + win.oid + '</a>';
			txt = "Object ID: " + win.oid;
			txt += "<br><br>About: " + value;
			txt += "<br><br>Base object URL: " + objurl;
			win.items.items[0].update(txt);
			win.doLayout();
		});
	}
});

Ext.reg('app.objectinfowindow', App.ObjectInfoWindow);

