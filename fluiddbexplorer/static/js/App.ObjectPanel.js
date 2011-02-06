App.ObjectPanel = Ext.extend(Ext.Panel, {
	border: false
	,iconCls: 'icon-tab-object'
	,closable: true
	,layout: 'vbox'
	,initComponent: function(){
		this.items = [
			{border:true,margins:"3 3 3 3",frame:true,layout:'fit',bodyStyle:'padding:2px;',html:"Object ID: " + this.oid}
			,new App.TagValuesGrid({oid: this.oid, flex: 1})
		];
		this.title = 'Object ' + this.oid.split('-')[0];
		this.tabTip = this.oid;

		App.ObjectPanel.superclass.initComponent.call(this);

	}
	,afterRender: function(){
		App.ObjectPanel.superclass.afterRender.apply(this, arguments);

		var panel = this;

		direct.GetTagValue(this.oid, "fluiddb/about", function(json){
			value = json.value;
			if (value.match(/^https?:\/\//)) {
				value = '<a href="' + value + '" target="_blank">' + value + '</a>';
			}
			txt = "Object ID: " + panel.oid + "<br><br>About: " + value;
			panel.items.items[0].update(txt);
			panel.doLayout();
		});
	}
});

Ext.reg('app.objectpanel', App.ObjectPanel);

