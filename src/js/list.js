var React = require('react/addons');
var $ = require('jquery');

var List = React.createClass({
	getInitialState: function () {
		return { userStatus: [] };
	},
	loadUserStatusFromServer: function () {
		$.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({userStatus: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });	
	},
	handleRequestSubmit: function (term) {
		var terms = this.state.userStatus;
		var newTerms = terms.concat([term]);
		this.setState({userStatus: newTerms});
 
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: term,
			success: function(data) {
			this.setState({userStatus: data});
			}.bind(this),
			error: function(xhr, status, err) {
			console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleApproveSubmit: function () {
		
	},
	componentDidMount: function () {
    this.loadUserStatusFromServer();
    setInterval(this.loadUserStatsFromServer, this.props.pollInterval);
	},
	render: function () {
		return (
			<div>
				<RequestForm onRequestSubmit={this.handleRequestSubmit}/>	
				<UserList data={this.state.userStatus} handleApproveSubmit={this.handleApproveSubmit}/>				
			</div>
		);
	}
});

var RequestForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var fromYear = React.findDOMNode(this.refs.fromYear).value.trim();
		var fromMonth = React.findDOMNode(this.refs.fromMonth).value.trim();
		var fromDay = React.findDOMNode(this.refs.fromDay).value.trim();
		var toYear = React.findDOMNode(this.refs.toYear).value.trim();
		var toMonth = React.findDOMNode(this.refs.toMonth).value.trim();
		var toDay = React.findDOMNode(this.refs.toDay).value.trim();
		if (!fromYear || !fromMonth) {
		return;
		}

		this.props.onRequestSubmit({
			name:'sisisin',
			term:fromYear + '/' + fromMonth + '/' + fromDay  + ' ~ ' + toYear + '/' + toMonth  + '/' + toDay,
			state:'待ち'
		});
		React.findDOMNode(this.refs.fromYear).value = '';
		React.findDOMNode(this.refs.fromYear).value = '';
		React.findDOMNode(this.refs.fromYear).value = '';
		React.findDOMNode(this.refs.fromYear).value = '';
		React.findDOMNode(this.refs.fromYear).value = '';
		React.findDOMNode(this.refs.fromYear).value = '';
		return;
	},
	render: function () {
		return (
			<form onSubmit={this.handleSubmit}>
					<select ref="fromYear"><option>2015</option></select>年
					<select ref="fromMonth"><option>1</option></select>月
					<select ref="fromDay"><option>1</option></select>日〜
					<select ref="toYear"><option>2015</option></select>年
					<select ref="toMonth"><option>1</option></select>月
					<select ref="toDay"><option>2</option></select>日まで
					<input type="submit" value="送信"></input>
				</form>	
		);
	}
});

var UserList = React.createClass({
	render: function () {
		var handleApproveSubmit = this.props.handleApproveSubmit;
		var status = this.props.data.map(function(user, i) {
			return (
				<tr>
					<td>{user.name}</td>
					<td>{user.term}</td>
					<td>{user.state}</td>
					<td><UserRequestApprove userId={i} handleApproveSubmit={handleApproveSubmit}/></td>
				</tr>);
		});
		return (
			<table>
				<tr>
					<td>名前</td>
					<td>期間</td>
					<td>状態</td>
					<td></td>
				</tr>
				{status}
			</table>
		);
	}
}).bind(this);

var UserRequestApprove = React.createClass({
	handleSubmit: function () {
		this.props.handleApproveSubmit(this.props.userId);
	},
	render: function () {
		return (
			<form onSubmit={this.handleSubmit}><input type="submit" value="承認" /></form>
		);
	}
});

React.render(
	<List url="/js/data.json" pollInterval={2000} />,
	document.getElementById('contents')
);