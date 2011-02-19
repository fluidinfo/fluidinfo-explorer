App.CreateObject = Ext.extend(Ext.Button, {
	text: 'Create new object'
	,initComponent: function(){
		App.CreateObject.superclass.initComponent.call(this);
	}
	,handler: function(btn){
		Ext.Msg.prompt('About tag', 'Enter an about tag (optional)', function(btn, value){
			if (btn == 'ok') {
				direct.CreateObject(value, function(objectid){
					Ext.getCmp('mainpanel').openObject(objectid);
				});
			}
		});
	}
});

Ext.reg('app.createobject', App.CreateObject);

