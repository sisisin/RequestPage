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
let Table = mui.Table;
let ThemeManager = new mui.Styles.ThemeManager();

injectTapEventPlugin();

let formatDate = (dt) => `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`;
let formatTime = (dt) => `${dt.getHours()}:${dt.getMinutes()}`;
let now = new Date();


var List = React.createClass({
	getInitialState: () => {
		return { userStatus: [], TANTOList: [] };
	},
	loadUserStatusFromServer: function () {
		$.ajax({
			url: this.props.userStatusUrl,
			dataType: 'json',
			cache: false,
			success: (data) => {
				this.setState({ userStatus: data });
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
				this.setState({ TANTOList: data });
			},
			error: (xhr, status, err) => {
				console.error(this.props.url, status, err.toString());
			}
		});
	},
	handleRequestSubmit: function (term) {
		var terms = this.state.userStatus;
		var newTerms = terms.concat([term]);
		this.setState({ userStatus: newTerms });

		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: term,
			success: (data) => {
				this.setState({ userStatus: data });
			},
			error: (xhr, status, err) => {
				console.error(this.props.url, status, err.toString());
			}
		});
	},
	handleApproveSubmit: function (index) {
		var newUserStatus = this.state.userStatus;
		switch (newUserStatus[index].state) {
			case 0:
				newUserStatus[index].state = 1;
				break;
			case 1:
				_.remove(newUserStatus, (val, i) => index === i);
				break;
			default:

		}
		this.setState({ userStatus: newUserStatus });
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
				<RequestForm TANTOList={this.state.TANTOList} onRequestSubmit={this.handleRequestSubmit} />
				<RequestUserListTable rowData={this.state.userStatus} handleApproveSubmit={this.handleApproveSubmit}/>
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
	getDate(){
		return this.refs.DatePicker.getDate();
	},
	render() {

		return (
			<DatePicker ref="DatePicker"
									hintText="Landscape Dialog"
									mode="landscape"
									autoOk={true}
									defaultDate={now}
									formatDate={formatDate} />
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
	getTime() {
		return this.refs.TimePicker.getTime();
	},
	render() {
		let nowtime = _.cloneDeep(now);
		nowtime.setMinutes(0);
		return (
			<TimePicker ref="TimePicker"
									hintText="Landscape Dialog"
									format="24hr"
									defaultTime={nowtime} />
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

	handleSubmit: function (e) {
		e.preventDefault();

		var TID = React.findDOMNode(this.refs.TID).value.trim();
		let name = (_.find(this.props.TANTOList, (val) => val.TID === TID)).name;
		var fromDate = formatDate(this.refs.fromDatePicker.getDate());
		var fromTime = formatTime(this.refs.fromTimePicker.refs.TimePicker.getTime());
		var toDate = formatDate(this.refs.toDatePicker.getDate());
		var toTime = formatTime(this.refs.toTimePicker.refs.TimePicker.getTime());

		this.props.onRequestSubmit({
		TID: TID,
		name: name,
			from: fromDate + ' ' + fromTime,
			to: toDate + ' ' + toTime,
			state: 0
		});
		return;
	},
	render: function () {

		return (
			<form onSubmit={this.handleSubmit}>
					<select ref="TID">
						{_.map(this.props.TANTOList, (tanto) => (
						<TANTOList key={tanto.TID} TID={tanto.TID} name={tanto.name} />))}
					</select>
					<RequestDatePicker ref="fromDatePicker" />
					<RequestTimePicker ref="fromTimePicker" />
				〜
					<RequestDatePicker ref="toDatePicker" />
					<RequestTimePicker ref="toTimePicker" />まで
					<input type="submit" value="送信" />
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

var RequestedUserList = React.createClass({
	handleSubmit: function (e) {
		e.preventDefault();
		this.props.handleApproveSubmit(this.props.index);
		return;
	},
	render: function () {
		return (
			<form onSubmit={this.handleSubmit}><input type="submit" value={mApprove[this.props.userState]} /></form>
		);
	}
});

let RequestUserListTable = React.createClass({
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},
	render() {
		// Column configuration
		let headerCols = {
			id: {
				content: 'ID',
				tooltip: 'TANTO ID'
			},
			name: {
				content: 'Name',
				tooltip: 'TANTO name'
			},
			term: {
				content: 'Term',
				tooltip: 'Connect Term'
			},
			status: {
				content: 'Status',
				tooltip: 'VDI status'
			},
			requestButton: {
				content: 'requestButton',
				tooltip: 'requestButton'
			}
		};
		let colOrder = ['id', 'name', 'term', 'status', 'requestButton'];
		// Footer column content can also be specified as [ 'ID', 'Name', 'Status'].
		let footerCols = {
			id: { content: 'ID' }, name: { content: 'Name' }, term: { content: 'Term' }, status: { content: 'Status' }, requestButton: { content: 'requestButton' }
		};

		// Table component
		return(
		<Table
		headerColumns={headerCols}
		footerColumns={footerCols}
		columnOrder={colOrder}
		rowData={convertTANTOListToTableRows(this.props.rowData, this.props.handleApproveSubmit)}
		height={'300px'}
		fixedHeader={true}
		fixedFooter={true}
		stripedRows={true}
		showRowHover={true}
		displayRowCheckbox={false}
		displaySelectAll={false}
		onRowSelection={this._onRowSelection} />
		);
}
});

function convertTANTOListToTableRows(TANTOList, handleApproveSubmit) {
	return _.map(TANTOList, (val, i) => {
		return {
			id: { content: val.TID },
			name: { content: val.name },
			term: { content: `${val.from} ~ ${val.to}` },
			status: { content: mState[val.state] },
			requestButton: { content: <RequestedUserList index={i} userState={val.state} handleApproveSubmit={handleApproveSubmit}/> }
		};
	});
};

function getNameByTID(TID) {

}

React.render(
	<List userStatusUrl="/js/data.json" TANTOUrl="/js/TANTO.json" pollInterval={2000} />,
	document.getElementById('contents')
);
