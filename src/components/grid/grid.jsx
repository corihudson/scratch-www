var classNames = require('classnames');
var React = require('react');

var FlexRow = require('../flex-row/flex-row.jsx');

require('./grid.scss');

var Grid = React.createClass({
    type: 'Grid',
    render: function () {
        var classes = classNames(
            'grid',
            this.props.className
        );
        return (
            <div className={classes}>
              <FlexRow className={this.props.type}>
                  {this.props.children}
              </FlexRow>
            </div>
        );
    }
});

module.exports = Grid;
