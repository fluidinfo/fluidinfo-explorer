App.ObjectPanel = Ext.extend(Ext.Panel, {
	border: false
	,iconCls: 'icon-tab-object'
	,closable: true
	,layout: 'vbox'
	,initComponent: function(){
		this.items = [
			new App.TagValuesGrid({oid: this.oid, flex: 1})
		];
		this.title = 'Object ' + this.oid.split('-')[0];
		this.tabTip = this.oid;

		App.ObjectPanel.superclass.initComponent.call(this);

	}
	,afterRender: function(){
		App.ObjectPanel.superclass.afterRender.apply(this, arguments);
	}
});

Ext.reg('app.objectpanel', App.ObjectPanel);

