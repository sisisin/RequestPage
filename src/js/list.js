var React = require('react/addons');
var $ = require('jquery');
var master = require('../../public/js/master');
var mState = master.state;
var mApprove = master.approveButton;
var _ = require('lodash');


var List = React.createClass({
	getInitialState: function () {
		return { userStatus: [], TANTOList:[] };
	},
	loadUserStatusFromServer: function () {
		$.ajax({
      url: this.props.userStatusUrl,
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
	loadTANTOListFromServer: function () {
		$.ajax({
      url: this.props.TANTOUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({TANTOList: data});
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
	handleApproveSubmit: function (index) {
		var newUserStatus = this.state.userStatus;
		newUserStatus[index].state = 1;
		this.setState({userStatus: newUserStatus});
	},
	componentDidMount: function () {
    this.loadUserStatusFromServer();
		this.loadTANTOListFromServer();
    //setInterval(this.loadUserStatusFromServer, this.props.pollInterval);
		//setInterval(this.loadTANTOListFromServer, this.pollInterval);
	},
	render: function () {
		return (
			<div>
				<RequestForm TANTOList={this.state.TANTOList} onRequestSubmit={this.handleRequestSubmit}/>	
				<UserTable data={this.state.userStatus} handleApproveSubmit={this.handleApproveSubmit}/>				
			</div>
		);
	}
});

var RequestForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var TID = React.findDOMNode(this.refs.TID).value.trim();
		var fromYear = React.findDOMNode(this.refs.fromYear).value.trim();
		var fromMonth = React.findDOMNode(this.refs.fromMonth).value.trim();
		var fromDay = React.findDOMNode(this.refs.fromDay).value.trim();
		var fromTime = React.findDOMNode(this.refs.fromTime).value.trim();
		var toYear = React.findDOMNode(this.refs.toYear).value.trim();
		var toMonth = React.findDOMNode(this.refs.toMonth).value.trim();
		var toDay = React.findDOMNode(this.refs.toDay).value.trim();
		var toTime = React.findDOMNode(this.refs.toTime).value.trim();
		if (!fromYear || !fromMonth) {
		return;
		}

		this.props.onRequestSubmit({
			name:TID,
			from:fromYear + '/' + fromMonth + '/' + fromDay + ' ' + fromTime + ':00',
			to:toYear + '/' + toMonth  + '/' + toDay + ' ' + toTime + ':00',
			state:0
		});
		return;
	},
	render: function () {
		return (
			<form onSubmit={this.handleSubmit}>
					<select ref="TID">
						{_.map(this.props.TANTOList, function (tanto) {
							 return (<TANTOList key={tanto.TID} TID={tanto.TID} name={tanto.name}/>);
							})}
					</select>
					<select ref="fromYear"><option>2015</option></select>年
					<select ref="fromMonth"><option>1</option></select>月
					<select ref="fromDay"><option>1</option></select>日
					<select ref="fromTime"><option>01</option></select>時〜
					<select ref="toYear"><option>2015</option></select>年
					<select ref="toMonth"><option>1</option></select>月
					<select ref="toDay"><option>2</option></select>日
					<select ref="toTime"><option>02</option></select>時まで
					<input type="submit" value="送信"></input>
				</form>	
		);
	}
});

var TANTOList = React.createClass({
	render: function () {
		return (
			<option value={this.props.TID}>{this.props.name}</option>
		);
	}
});

var UserTable = React.createClass({
	render: function () {
		return (
			<table>
				<tr>
					<td>名前</td>
					<td>期間</td>
					<td>状態</td>
					<td></td>
				</tr>
				{this.props.data.map(function (user, i) {
					return (<RequestedUserList user={user} index={i} key={user.TID} handleApproveSubmit={this.props.handleApproveSubmit}/>);
				}.bind(this))}
			</table>
		);
	}
}).bind(this);

var RequestedUserList = React.createClass({
	handleSubmit: function (e) {
		e.preventDefault();
		this.props.handleApproveSubmit(this.props.index);
		return;
	},
	render: function () {
		var term = this.props.user.from + ' ~ ' + this.props.user.to;
		return (
					<tr>
						<td>{this.props.user.name}</td>
						<td>{term}</td>
						<td>{mState[this.props.user.state]}</td>
						<td><form onSubmit={this.handleSubmit}><input type="submit" value={mApprove[this.props.user.state]} /></form></td>
					</tr>
		);
	}
});

React.render(
	<List userStatusUrl="/js/data.json" TANTOUrl="/js/TANTO.json" pollInterval={2000} />,
	document.getElementById('contents')
);
