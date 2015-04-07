Tasks = new Mongo.Collection("tasks");
Router.route('/', function(){
  this.render('list')
})
if (Meteor.isClient) {
  Meteor.startup(function () {
      _.extend(Notifications.defaultOptions, {
          timeout: 5000
      });
  })
;  Template.widgetTable.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    }, 
    incompleteTasks: function(){
      return Tasks.find({checked: {$ne:true}}).count();
    }
  });
  
  Template.widgetAdd.events({
    "submit .new-widget": function(event){
      var text = event.target.widgetName.value; 
      var client = event.target.client.value; 
      // console.log(client)
      
      Tasks.insert({
        text: text, 
        client: client,
        createdAt: new Date(), 
        owner: Meteor.userId(), 
        username: Meteor.user().username
      }); 
      
      Notifications.success('Added ' + text, 'for' + client);
      
      event.target.widgetName.value = ""; 
      event.target.client.value = ""
      return false; 
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  }); 
  Template.task.events({
    "click .toggle-checked": function() {
      Tasks.update(this._id, {$set: {checked: ! this.checked}}); 
    },
    "click .delete": function (){
      Tasks.remove(this._id); 
      Notifications.info('Deleted', this.text); 
    }
  }); 
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}
