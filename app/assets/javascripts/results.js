var Arcana = Arcana || {};

Arcana.Result = Backbone.Model.extend({
	url: '/results',
	paramRoot: 'result',
  defaults: {
    id: null,
    mark: null,
    student_name: null,
    assessment_name: null,
    assessment_id: null,
    student_id: null
    
  },

  idAttribute: 'id'
});

Arcana.ResultsCollection = Backbone.Collection.extend({
  model: Arcana.Result,
  url: '/results',
  
	search : function(letters){
		if(letters == "") return this;
	 
			var pattern = new RegExp(letters,"gi");
		return _(this.filter(function(data) {
		  	return pattern.test(data.get("assessment_name"));
		}));
	}
});

Arcana.ResultView = Backbone.View.extend({
  tagName: 'tr',
  template: '<td><%= student_name %></td><td><%= assessment_name %></td><td><%= mark %></td><td></td>',

  events: {
    //'dblclick tr': 'editResult'
  },

  deleteResult: function() {
    this.model.destroy();

    this.remove();
  },

  render: function() {
  	
    
    var tmpl = _.template( this.template );
    

    this.$el.html( tmpl( this.model.toJSON() ) );

    return this;
  }
});

Arcana.IndexView = Backbone.View.extend({
  el: $( '#results-special' ),
  
  initialize: function() {
    this.collection = new Arcana.ResultsCollection();
    var that = this;
    this.childViews = [];
    this.collection.fetch({success: function(){
   		that.render();
   	}});
   	
   	

 

    //this.listenTo( this.collection, 'add', this.renderResult );
    //this.listenTo( this.collection, 'reset', this.render );
  },

  events: {
    //'click .result-submit': 'addResult'
  },
  
  	search: function(e){
		var letters = $('.search-results').val();
		this.renderList(this.collection.search(letters));
	},
	
	renderList : function(results){
		_.each(this.childViews, function(childView){ 
		childView.remove();	
		});
 		var that = this;
		results.each(function(result){
			that.renderResult(result);
		});
		return this;
	},

  addResult: function( e ) {
	newResult =  new Arcana.Result();
	newResult.set( { mark: $('input[name="result[mark]"]').val(), assessment_id: $('#result_assessment_id').val()} );
	newResult.save(null, {success: refreshView});
	return false;
  },

  render: function() {
    this.collection.each(function( item ) {
      this.renderResult( item );
    }, this );
  },

  renderResult: function( item ) {
	console.log(item);
    var resultView = new Arcana.ResultView({
      model: item
    });
    
    $('.res-table').append( resultView.render().el );
  	this.childViews.push(resultView);
  }
});

var indView;

$(function (){
	$(document).ready(function () {
  indView = new Arcana.IndexView();
  $('.result-submit').click(indView.addResult);
  $('#mark-sort').click(function () {
  	indView.collection.comparator = function(model) {
    	return -model.get('mark');
	};
	
	_.each(indView.childViews, function(childView){ 
		childView.remove();	
	});
	indView.collection.sort();
	indView.render();
  });
	$('#student-sort').click(function () {
  	indView.collection.comparator = function(model) {
    	return model.get('student_name');
	};
	
	_.each(indView.childViews, function(childView){ 
		childView.remove();	
	});
	indView.collection.sort();
	indView.render();
  });
  
$('#assessment-sort').click(function () {
  	indView.collection.comparator = function(model) {
    	return model.get('assessment_name');
	};
	
	_.each(indView.childViews, function(childView){ 
		childView.remove();	
	});
	indView.collection.sort();
	indView.render();
  });
});

$('.search-results').keydown(function () {
	indView.search();
});
});
function refreshView () {
	 indView = new Arcana.IndexView();
}

