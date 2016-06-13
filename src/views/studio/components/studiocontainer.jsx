var React = require('react');
var FormattedMessage = require('react-intl').FormattedMessage;

var Thumbnail = require('../../../components/thumbnail/thumbnail.jsx');
var Grid = require('../../../components/grid/grid.jsx');
var SubNavigation = require('../../../components/subnavigation/subnavigation.jsx');

var Api = require('../../../mixins/api.jsx');

var StudioContainer = React.createClass({
    type: 'StudioContainer',
    mixins: [
        Api
    ],
    getInitialState: function () {
        return {
            status: 'NOT_FETCHED',
            loaded: [],
            offset: 1
        };
    },
    componentWillMount: function () {
        this.getGrid();
    },
    getGrid: function () {
        if (this.props.type == 'projects'){
            this.api({
                host: 'https://crossorigin.me/https://scratch.mit.edu/site-api',
                uri: '/projects/in/' + this.props.id + '/' + this.state.offset
            }, function (err, body) {
                if (!err) {
                    var parser = new DOMParser();
                    var parsed = Array.from(parser.parseFromString(body,'text/html').querySelectorAll('.project'));
                    var items = parsed.map(function (i) {
                        return {
                            id:i.getAttribute('data-id'),
                            title:i.querySelector('.title > a').innerHTML,
                            image: 'https://cdn2.scratch.mit.edu/get_image/project/'
                            + i.getAttribute('data-id') +'_480x360.png',
                            href: '/projects/' + i.getAttribute('data-id'),
                            creator: i.querySelector('.owner > a').innerHTML
                        };
                    });
                    var loadedSoFar = this.state.loaded;
                    Array.prototype.push.apply(loadedSoFar,items);
                    this.setState({loaded: loadedSoFar});
                    this.setState({offset: this.state.offset + 1});
                }
            }.bind(this));
        } else if (this.props.type == 'curators') {
            this.api({
                host: 'https://crossorigin.me/https://scratch.mit.edu/site-api',
                uri: '/users/curators-in/' + this.props.id + '/' + this.state.offset
            }, function (err, body) {
                if (!err) {
                    var parser = new DOMParser();
                    var parsed = Array.from(parser.parseFromString(body,'text/html').querySelectorAll('li'));
                    var items = parsed.map(function (i) {
                        return {
                            id: i.querySelector('.avatar').getAttribute('data-id'),
                            title:i.querySelector('.avatar > .title > a').innerHTML,
                            image: i.querySelector('.avatar > a > img').getAttribute('src'),
                            href: i.querySelector('.avatar > a').getAttribute('href'),
                            creator: ''
                        };
                    });
                    var loadedSoFar = this.state.loaded;
                    Array.prototype.push.apply(loadedSoFar,items);
                    this.setState({loaded: loadedSoFar});
                    var currentOffset = this.state.offset + 1;
                    this.setState({offset: currentOffset});
                }
            }.bind(this));
        }
    },
    render: function () {
            return (
                <div>
                    <Grid type={this.props.type}>
                    {this.state.loaded.map(function (item) {
                        return (
                        <Thumbnail key={item.id}
                                   title={item.title}
                                   src={item.image}
                                   href={item.href}
                                   type={this.props.type.substring(0,this.props.type.length - 1)}
                                   creator={item.creator}
                                   context='studio'/>
                           );
                    }.bind(this))}
                    </Grid>
                    {(this.props.type == 'projects') ?
                    (<SubNavigation className='load'>
                        <button onClick={this.getGrid}>
                            <li>
                                <FormattedMessage
                                    id='load'
                                    defaultMessage={'Load More'} />
                            </li>
                        </button>
                    </SubNavigation>) : null}
            </div>
        );}
});

module.exports = StudioContainer;
