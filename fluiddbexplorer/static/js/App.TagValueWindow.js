App.TagValueWindow = Ext.extend(Ext.Window, {
	title: 'Tag an object'
	,modal: true
	,center: true
	,border: false
	,width: 350
	,height: 150
	,layout: 'fit'
	,initComponent: function(){

		this.items = [{
			xtype: 'form'
			,labelAlign: 'right'
			,labelWidth: 75
			,frame: true
			,api: {submit: direct.TagObjectForm}
			,baseParams: {oid: this.oid}
			,paramsAsHash: false
			,paramOrder: ['oid', 'tag', 'value', 'type']
			,defaultType: 'textfield'
			,defaults: {
				allowBlank: false
				,anchor: '-5'
				,listeners: {
					scope: this
					,specialkey: function(field, e) {
						if (e.getKey() === e.ENTER) {
							this.onOk();
						}
					}
				}
			}
			,items: [
				{fieldLabel: 'Tag', name: 'tag', value: this.tag}
				,{fieldLabel: 'Value', name: 'value'}
				,{fieldLabel: 'Type', name: 'type', xtype: 'combo', hiddenName: 'type', mode: 'local', editable: false, typeAhead: false, allowBlank: false, triggerAction: 'all',  store: [['string', 'String'], ['int', 'Integer'], ['float', 'Floating point'], ['list', 'List of strings']], value: 'string'}
			]
		}];
		this.buttons = [
			{text: 'OK', handler: this.onOk, scope: this}
			,{text: 'Cancel', handler: this.close, scope: this}
		]
		App.TagValueWindow.superclass.initComponent.call(this);
	}
	,onOk: function() {
		win = this;

		form = win.get(0).getForm();
		if (form.isValid()) {
			win.el.mask('Please wait...', 'x-mask-loading');
			form.submit({
				success: function(r, o){win.el.unmask();win.fireEvent('tagged');}
				,failure: function(r, o){win.el.unmask();}
			});
		}
	}
});

Ext.reg('app.tagvaluewindow', App.TagValueWindow);

