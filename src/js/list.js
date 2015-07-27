var React = require('react/addons');
var injectTapEventPlugin = require('react-tap-event-plugin');
var $ = require('jquery');
var master = require('../../public/js/master');
var mState = master.state;
var mApprove = master.approveButton;
var _ = require('lodash');

var mui = require('material-ui');
var DatePicker = mui.DatePicker;
let TimePicker = mui.TimePicker;
let ThemeManager = new mui.Styles.ThemeManager();

injectTapEventPlugin();

let formatDate = (dt) => `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`;
let formatTime = (dt) => `${dt.getHours()}:${dt.getMinutes()}`;
let now = new Date();

var List = React.createClass({
	getInitialState: () => {
		return { userStatus: [], TANTOList:[] };
	},
	loadUserStatusFromServer: function () {
		$.ajax({
      url: this.props.userStatusUrl,
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({userStatus: data});
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }
    });
	},
	loadTANTOListFromServer: function () {
		$.ajax({
      url: this.props.TANTOUrl,
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({TANTOList: data});
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }
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
			success: (data) => {
			this.setState({userStatus: data});
			},
			error: (xhr, status, err) => {
			console.error(this.props.url, status, err.toString());
			}
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


var RequestDatePicker = React.createClass({
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},
	render() {

		return (
			<DatePicker 
				ref="DatePicker"
				hintText="Landscape Dialog"
				mode="landscape"
				autoOk={true}
				defaultDate={now}
				formatDate={formatDate}
				/>
		);
	}
});

let RequestTimePicker = React.createClass({
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},
	render() {
		let nowtime = _.cloneDeep(now);
		nowtime.setMinutes(0);
		return (
			<TimePicker 
				ref="TimePicker"
				hintText="Landscape Dialog"
				format="24hr"
				defaultTime={nowtime}
				/>
		);
	}	
});

var RequestForm = React.createClass({
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},

	handleSubmit: function(e) {
		e.preventDefault();

		var TID = React.findDOMNode(this.refs.TID).value.trim();
		var fromDate = formatDate(this.refs.fromDatePicker.refs.DatePicker.getDate());
		var fromTime = formatTime(this.refs.fromTimePicker.refs.TimePicker.getTime());
		var toDate = formatDate(this.refs.toDatePicker.refs.DatePicker.getDate());
		var toTime = formatTime(this.refs.toTimePicker.refs.TimePicker.getTime());

		this.props.onRequestSubmit({
			name:TID,
			from:fromDate + ' ' + fromTime,
			to:toDate + ' ' + toTime,
			state:0
		});
		return;
	},
	render: function () {

		return (
			<form onSubmit={this.handleSubmit}>
					<select ref="TID">
						{_.map(this.props.TANTOList, (tanto) => (<TANTOList key={tanto.TID} TID={tanto.TID} name={tanto.name}/>))}
					</select>
					<RequestDatePicker ref="fromDatePicker"/>
					<RequestTimePicker ref="fromTimePicker"/>					
					〜
					<RequestDatePicker ref="toDatePicker"/>
					<RequestTimePicker ref="toTimePicker"/>まで
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
				{this.props.data.map((user, i) => {
					return (<RequestedUserList user={user} index={i} key={user.TID} handleApproveSubmit={this.props.handleApproveSubmit}/>);
				})}
			</table>
		);
	}
});

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
