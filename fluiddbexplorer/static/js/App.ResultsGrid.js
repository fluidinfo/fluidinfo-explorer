App.ResultsGrid = Ext.extend(Ext.grid.GridPanel, {
	border: false
	,hideMode: 'offsets'
	,closable: true
	,title: 'Query results'
	,loadMask: true
	,query: null
	,iconCls: 'icon-tab-results'
	,initComponent: function(){
		this.sm = new Ext.grid.RowSelectionModel({singleSelect:true});
		this.store = new Ext.data.DirectStore({
			directFn: direct.Query
			,paramsAsHash: false
			,paramOrder: 'query'
			,autoDestroy: true
			,root: 'ids'
			,fields: ['oid', 'about', 'type']
		});
		this.tbar = [
			{text:'Refresh',iconCls:'icon-refresh',scope:this,handler:this.doRefresh}
			,{text:'Load all about tags',iconCls:'icon-fetch-all',scope:this,handler:this.onLoadAll}
		];
		this.action = new Ext.ux.grid.RowActions({
			header: 'Actions'
			,widthIntercept: 10
			,actions: [
				{iconCls: 'icon-refresh', tooltip: 'Refresh about tag'}
				,{iconCls: 'icon-object-open', tooltip: 'Open that object'}
			]
			,callbacks:{
				'icon-refresh': this.onRefreshRow.createDelegate(this)
				,'icon-object-open': this.onOpenObject.createDelegate(this)
			}
		});
		this.columns = [
			this.action
			,{id:'oid', header:'Object ID', width: 230, dataIndex: 'oid', sortable: true}
			,{header: 'About tag', width: 600, dataIndex: 'about', sortable: true, renderer: {fn: this.aboutTagRenderer, scope: this}}
		];
		this.view = new Ext.ux.grid.BufferView({
			scrollDelay: false
			,emptyText: 'Nothing to display'
		});
		this.plugins = [this.action];
		App.ResultsGrid.superclass.initComponent.call(this);

		this.on('rowdblclick', this.onRowDblClick, this);
		this.on('cellclick', this.onCellClick, this);
	}
	,afterRender: function(){
		App.ResultsGrid.superclass.afterRender.apply(this, arguments);

		this.doRefresh();
	}
	,aboutTagRenderer: function(value, metaData, rec) {
		type = rec.data.type;
		if (type == 'notfetch') {
			metaData.css = 'gridclicktofetch';
			return 'Click to show about tag';
		}

		if (value.match(/^https?:\/\//)) {
			value = '<a href="' + value + '" target="_blank">' + value + '</a>';
		}
		return value;
	}
	,onCellClick: function(grid, rowIndex, columnIndex, e) {
		if (columnIndex != 2) {
			return;
		}

		var rec = grid.getStore().getAt(rowIndex);
		if (rec.data.type == 'notfetch') {
			this.setAboutTag(rec);
		}
	}
	,execQuery: function(a){
		this.store.load({params: {query:a}});
	}
	,doRefresh: function(){
		if (this.query) {
			this.setTitle('Query results: "' + this.query + '"');
			this.execQuery(this.query);
		}
	}
	,onOpenObject: function(g, r){
		Ext.getCmp('mainpanel').openObject(r.data.oid);
	}
	,onRowDblClick: function(grid, rowIndex, e){
		var row = grid.store.getAt(rowIndex);
		var oid = row.data.oid;
		Ext.getCmp('mainpanel').openObject(oid);
	}
	,onLoadAll: function(a){
		this.store.each(function(r){
			if (r.data.type == 'notfetch') {
				this.setAboutTag(r);
			}
		}, this);
	}
	,onRefreshRow: function(g, r, action, row, col){
		this.setAboutTag(r);
	}
	,setAboutTag: function(r){
		r.set('type', 'primitive');
		r.set('about', '<em>loading...</em>');
		direct.GetTagValue(r.data.oid, "fluiddb/about", function(json){
			r.set('about', json.value);
			r.commit();
		});
	}
});

Ext.reg('app.resultsgrid', App.ResultsGrid);

