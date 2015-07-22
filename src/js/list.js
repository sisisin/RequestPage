var React = require('react/addons');
var $ = require('jquery');

var userStatus = [
		{
		name:'sisisin',
		term:'2015/1/1 ~ 2015/2/1',
		state:'待ち'
	}
];

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
	componentDidMount: function () {
    this.loadUserStatusFromServer();
    setInterval(this.loadUserStatsFromServer, this.props.pollInterval);
	},
	render: function () {
		return (
			<div>
				<form>
					<select><option>1</option></select>年
					<select><option>1</option></select>月
					<select><option>1</option></select>日〜
					<select><option>1</option></select>年
					<select><option>1</option></select>月
					<select><option>2</option></select>日まで
					<input type="button" value="送信"></input>
				</form>				
				<UserList data={this.state.userStatus}/>				
			</div>
		);
	}
});

var UserList = React.createClass({
	render: function () {
		var status = this.props.data.map(function(user) {
			return (
				<tr>
					<td>{user.name}</td>
					<td>{user.term}</td>
					<td>{user.state}</td>
				</tr>);
		});
		return (
			<table>
				<tr>
					<td>名前</td>
					<td>期間</td>
					<td>状態</td>
				</tr>
				{status}
			</table>
		);
	}
});


React.render(
	<List url="/js/data.json" pollInterval={2000} />,
	document.getElementById('contents')
);
