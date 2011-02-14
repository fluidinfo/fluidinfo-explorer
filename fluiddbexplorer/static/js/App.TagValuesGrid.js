App.TagValuesGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	border: false
	,closable: true
	,title: 'Tag values'
	,loadMask: true
	,oid: null
	,initComponent: function(){
		this.sm = new Ext.grid.RowSelectionModel({singleSelect:true});
		this.store = gridstore = new Ext.data.GroupingStore({
			proxy: new Ext.data.DirectProxy({
				directFn: direct.TagValuesFetch
				,paramsAsHash: false
				,paramOrder: 'oid'
			})
			,autoDestroy: true
			,groupField: 'ns'
			,sortInfo: {field: 'tag', direction: 'ASC'}
			,remoteSort: false
			,reader: new Ext.data.JsonReader({
				root: 'tags'
				,idProperty: 'tag'
				,fields: ['ns', 'tag', 'value', 'readonly', 'type']
			})
		});
		this.view = new Ext.grid.GroupingView({
			forceFit: true
			,groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
			,emptyText: 'Nothing to display'
		});
		this.tbar = [
			{text: 'Refresh', iconCls: 'icon-refresh', handler: this.onRefresh, scope: this}
			,{text: 'Load all tag values', iconCls: 'icon-fetch-all', handler: this.onLoadAllTags, scope: this}
			,{text: 'Add a tag', iconCls: 'icon-tag-add', handler: this.onAddTag, scope: this}
			,'-'
			,{text: 'View visual representation', iconCls: 'icon-eye', handler: function(){ window.open("http://abouttag.appspot.com/id/butterfly/"+this.oid);}, scope: this}
		];
		this.action = new Ext.ux.grid.RowActions({
			actions: [
				{iconCls: 'icon-refresh', tooltip: 'Load tag value'}
				,{iconCls: 'icon-tag-remove', tooltip: 'Remove tag'}
			]
			,callbacks:{
				'icon-refresh': this.onRefreshRow.createDelegate(this)
				,'icon-tag-remove': this.onDeleteTag.createDelegate(this)
			}
		});
		this.colModel = new Ext.grid.ColumnModel({
			columns: [
				this.action
				,{header:'Namespace', dataIndex: 'ns', hidden: true}
				,{id:'tag', header:'Tag', width: 230, dataIndex: 'tag', sortable: true}
				,{header: 'Value', width: 600, dataIndex: 'value', sortable: true, renderer: {fn: this.valueRenderer, scope: this}, editor: {xtype: 'textfield'}}
			]
			,isCellEditable: function(col, row) {
				var record = gridstore.getAt(row);
				if (record.get('readonly')) {
					return false;
				}
				return Ext.grid.ColumnModel.prototype.isCellEditable.call(this, col, row);
			}
		});

		this.plugins = [this.action];
		App.TagValuesGrid.superclass.initComponent.call(this);

		// TODO: See why cellclick can't be used (like App.ResultsGrid)
		this.on('cellmousedown', this.onCellClick, this);
	}
	,afterRender: function(){
		App.TagValuesGrid.superclass.afterRender.apply(this, arguments);

		if (this.oid) {
			this.store.load({params: {oid: this.oid}});
		}

		this.on('afteredit', this.onAfterEdit, this);
		this.body.on('click', this.onClick, this);
	}
	,onAfterEdit: function(e){
		var tag = e.record.data.tag;
		var value = e.value;

		direct.TagObject(this.oid, tag, value, function(){e.record.commit();});
	}
	,onAddTag: function(){
		store = this.store;
		oid = this.oid;
		
		Ext.Msg.prompt('Tag', 'Please enter full tag path', function(btn, tag){
			if (btn == 'ok') {
				Ext.Msg.prompt('Value', 'Value', function(btn, value){
					if (btn == 'ok') {
						direct.TagObject(oid, tag,  value, function(){store.reload();});
					}
				});
			}
		});

	}
	,onLoadAllTags: function(a){
		this.store.each(function(r){
			if (r.data.type == 'notfetch') {
				this.setTag(r);
			}
		}, this);
	}
	,onRefresh: function(){
		this.store.reload();
	}
	,onRefreshRow: function(g, r, action, row, col){
		this.setTag(r);
	}
	,onDeleteTag: function(g, r, action, row, col){
		r.set('value', '<em>removing tag...</em>');
		direct.DeleteTagValue(this.oid, r.data.tag, function(a,b){if (b.status) g.store.remove(r); else r.commit();});
	}
	,setTag: function(r){
		r.set('type', 'primitive');
		r.set('value', '<em>loading...</em>');
		oid = this.oid;
		direct.GetTagValue(oid, r.data.tag, function(json){
			type = json.type;

			if (type == 'primitive') {
				value = json.value;
			}
			else if (type == 'empty') {
				// TODO: Add color and/or icon
				value = 'empty';
			}
			else if (type == 'opaque') {
				value = 'Opaque value with content-type: "' + json.value + '" <a href="http://' + App.Config.baseurl_instance + '/objects/'+oid+'/'+r.data.tag+'" target="_blank">open</a>';
			}
			else {
				value = 'Unsupported type: "' + type + '"';
			}
			r.set('value', value);
			r.set('type', type);
			r.set('readonly', json.readonly);
			r.commit();
		});
	}
	,valueRenderer: function(value, metaData, rec) {
		type = rec.data.type;
		if (type == 'notfetch') {
			metaData.css = 'gridclicktofetch';
			return 'Click to load tag value';
		}

		if (value.match(/^https?:\/\//)) {
			return '<a href="' + value + '" target="_blank">' + value + '</a>';
		}

		if (!value.match(/^Opaque value with content-type/)) {
			value = value.replace(/(([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12})/g, '<a href="" expl:objectid="$1" class="openobject">$1</a>');
		}

		return value;
	}
	,onCellClick: function(grid, rowIndex, columnIndex, e) {
		if (columnIndex != 3) {
			return;
		}

		var rec = grid.getStore().getAt(rowIndex);
		if (rec.data.type == 'notfetch') {
			this.setTag(rec);
		}
	}
	,onClick: function(e, target) {
		if (target = e.getTarget('.openobject', 2)) {
			e.stopEvent();
			objid = Ext.fly(target).getAttributeNS('expl', 'objectid');
			Ext.getCmp('mainpanel').openObject(objid);
		}
	}
});

Ext.reg('app.tagvaluesgrid', App.TagValuesGrid);

