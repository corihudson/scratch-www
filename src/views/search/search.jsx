var injectIntl = require('react-intl').injectIntl;
var FormattedMessage = require('react-intl').FormattedMessage;
var React = require('react');
var render = require('../../lib/render.jsx');

var Api = require('../../mixins/api.jsx');

var Page = require('../../components/page/www/page.jsx');
var Box = require('../../components/box/box.jsx');
var SubNavigation = require('../../components/subnavigation/subnavigation.jsx');
var Tabs = require('../../components/tabs/tabs.jsx');
var Grid = require('../../components/grid/grid.jsx');
var Thumbnail = require('../../components/thumbnail/thumbnail.jsx');

require('./search.scss');

// @todo migrate to React-Router once available
var Search = injectIntl(React.createClass({
    type: 'Search',
    mixins: [
        Api
    ],
    getDefaultProps: function () {
        var query = window.location.search;
        var pathname = window.location.pathname.toLowerCase();
        if (pathname[pathname.length - 1] === '/') {
            pathname = pathname.substring(0, pathname.length - 1);
        }
        var start = pathname.lastIndexOf('/');
        var type = pathname.substring(start + 1, pathname.length);
        var q = query.lastIndexOf('q=');
        var term = '';
        if (q !== -1) {
            term = query.substring(q + 2, query.length).toLowerCase();
        }
        while (term.indexOf('/') > -1) {
            term = term.substring(0, term.indexOf('/'));
        }
        while (term.indexOf('&') > -1) {
            term = term.substring(0, term.indexOf('&'));
        }
        term = term.split('+').join(' ');

        return {
            tab: type,
            searchTerm: term,
            loadNumber: 16
        };
    },
    getInitialState: function () {
        return {
            loaded: [],
            offset: 0
        };
    },
    componentDidMount: function () {
        this.getSearchMore();
    },
    getSearchMore: function () {
        var termText = '';
        if (this.props.searchTerm !== '') {
            termText = '&q=' + this.props.searchTerm;
        }
        this.api({
            uri: '/search/' + this.props.tab +
                 '?limit=' + this.props.loadNumber +
                 '&offset=' + this.state.offset +
                 termText
        }, function (err, body) {
            var loadedSoFar = this.state.loaded;
            Array.prototype.push.apply(loadedSoFar, body);
            this.setState({loaded: loadedSoFar});
            var currentOffset = this.state.offset + this.props.loadNumber;
            this.setState({offset: currentOffset});
        }.bind(this));
    },
    getTab: function (type) {
        var term = this.props.searchTerm.split(' ').join('+');
        var allTab = <a href={'/search/' + type + '?q=' + term + '/'}>
                        <li>
                            <FormattedMessage id={'general.' + type} />
                        </li>
                    </a>;
        if (this.props.tab == type) {
            allTab = <a href={'/search/' + type + '?q=' + term + '/'}>
                        <li className='active'>
                            <FormattedMessage id={'general.' + type} />
                        </li>
                    </a>;
        }
        return allTab;
    },
    render: function () {
        var formatMessage = this.props.intl.formatMessage;

        return (
            <div>
                <div className='outer'>
                    <Box title={formatMessage({id: 'general.results'}) + ':'}
                         subtitle={this.props.searchTerm}
                         moreProps={{className: 'subnavigation'}}>
                        <Tabs>
                            {this.getTab('projects')}
                            {this.getTab('studios')}
                        </Tabs>
                        <div id='projectBox' key='projectBox'>
                            <Grid type={this.props.itemType}>
                                  {this.state.loaded.map(function (item) {
                                      var href = '/' + this.props.tab + '/' + item.id + '/';

                                      if (this.props.tab == 'projects') {
                                          return (
                                            <Thumbnail key={item.id}
                                                       showLoves={true}
                                                       showFavorites={true}
                                                       showRemixes={true}
                                                       showViews={true}
                                                       type={'project'}
                                                       href={href}
                                                       title={item.title}
                                                       src={item.image}
                                                       creator={item.creator}
                                                       loves={item.stats.loves}
                                                       favorites={item.stats.favorites}
                                                       remixes={item.stats.remixes}
                                                       views={item.stats.views}  />
                                        );
                                      }
                                    else {
                                          return (
                                            <Thumbnail key={item.id}
                                                       type={'gallery'}
                                                       href={href}
                                                       title={item.title}
                                                       src={item.image}
                                                       owner={item.owner}  />
                                        );
                                      }
                                  }.bind(this))}
                            </Grid>
                            <SubNavigation className='load'>
                                <button onClick={this.getSearchMore}>
                                    <li>
                                        <FormattedMessage id='general.loadMore' />
                                    </li>
                                </button>
                            </SubNavigation>
                        </div>
                    </Box>
                </div>
            </div>
        );
    }
}));

render(<Page><Search /></Page>, document.getElementById('app'));
