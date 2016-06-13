var injectIntl = require('react-intl').injectIntl;
var FormattedMessage = require('react-intl').FormattedMessage;
var React = require('react');
var render = require('../../lib/render.jsx');

var Api = require('../../mixins/api.jsx');
var StudioContainer = require('./components/studiocontainer.jsx');

var Page = require('../../components/page/www/page.jsx');
var Tabs = require('../../components/tabs/tabs.jsx');
var Button = require('../../components/forms/button.jsx');
var Thumbnail = require('../../components/thumbnail/thumbnail.jsx');

// var DropdownBanner = require('../../components/dropdown-banner/banner.jsx');

require('./studio.scss');

// @todo migrate to React-Router once available
var Studio = injectIntl(React.createClass({
    type: 'Studio',
    mixins: [
        Api
    ],
    getDefaultProps: function () {
        var typeOptions = ['projects','curators','comments','activity'];

        var pathname = window.location.pathname.toLowerCase();
        if (pathname.substring(pathname.length - 1, pathname.length) === '/') {
            pathname = pathname.substring(0, pathname.length-1);
        }
        var slash = pathname.lastIndexOf('/');
        var type = pathname.substring(slash + 1, pathname.length);
        // type = (type == 'curators') ? 'users' : type;
        var typeStart = pathname.indexOf('studios/');
        var id = pathname.substring(typeStart + 8,slash);
        if (typeOptions.indexOf(type) === -1) {
            id = pathname.substring(typeStart + 8);
            window.location = window.location.origin + '/studios/' + id + '/projects';
        }

        return {
            acceptableTypes: typeOptions,
            itemType: type,
            studioId: id,
            loadNumber: 16
        };
    },
    getInitialState: function () {
        return {
            loaded: [],
            offset: 1,
            title: 'Studio',
            description: '',
            image: ''
        };
    },
    componentDidMount: function () {
        // this.getInfo();
        this.getGrid();
    },
    // getInfo: function () {
    //     this.api({
    //         host: 'https://crossorigin.me/https://scratch.mit.edu/site-api',
    //         uri: '/galleries/all/' + this.props.studioId
    //     }, function (err, body) {
    //         if (!err){
    //             this.setState({title: body.title});
    //             this.setState({description: body.description});
    //         }
    //         this.setState({title: 'foobarbaz'});
    //     }.bind(this));
    // },
    getGrid: function () {
        if (this.props.itemType == 'curators') {
            //https://crossorigin.me/https://scratch.mit.edu/site-api/users/curators-in
            this.api({
                host: 'https://crossorigin.me/https://scratch.mit.edu/site-api',
                uri: '/users/curators-in/' + this.props.studioId + '/' + this.state.offset
            }, function (err, body) {
                if (!err) {
                    var parser = new DOMParser();
                    var parsed = Array.from(parser.parseFromString(body,'text/html').querySelectorAll('li'));
                    var items = parsed.map(function (i) {
                        return {
                            id: i.querySelector('.avatar').getAttribute('data-id'),
                            title:i.querySelector('.avatar > .title > a').innerHTML,
                            image: i.querySelector('.avatar > a > img').getAttribute('src'),
                            href: i.querySelector('.avatar > a').getAttribute('href')
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
    updateOffset: function () {
        this.setState({offset: this.state.offset + 1});
    },
    changeItemType: function () {
        var newType;
        for (var t in this.props.acceptableTypes) {
            if (this.props.itemType != t) {
                newType = t;
                break;
            }
        }
        newType = newType;
    },
    getTab: function (type) {
        var allTab = <a href={'/studios/' + this.props.studioId + '/' + type + '/'}>
                        <li>
                            <FormattedMessage
                                id={'explore.' + type}
                                defaultMessage={type.charAt(0).toUpperCase() + type.slice(1)} />
                        </li>
                    </a>;
        if (this.props.itemType==type) {
            allTab = <a href={'/studios/' + this.props.studioId + '/' + type + '/'}>
                        <li className='active' name={type}>
                            <FormattedMessage
                                id={'explore.' + type}
                                defaultMessage={type.charAt(0).toUpperCase() + type.slice(1)} />
                        </li>
                    </a>;
        }
        return allTab;
    },
    render: function () {
        return (
            <div>
                <div className='outer'>
                    <div className="description">
                        <div className="inner">
                            <h1 id='studio-title'>{this.state.title}</h1>
                            <div className="info">
                                <div className="left">
                                    <Thumbnail key='studioThumbnail'
                                               type='gallery'
                                               src={'//cdn2.scratch.mit.edu/get_image/gallery/' +
                                                    this.props.studioId + '_200x130.png'}
                                               title=''/>
                                    <Button>Follow Studio</Button>
                                </div>
                                <div className="right">
                                    <textarea></textarea>
                                    <a href="#" id="report">Report this Studio</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='box'>
                        <div className="tab-background">
                            <Tabs>
                                {this.getTab('projects')}
                                {this.getTab('comments')}
                                {this.getTab('curators')}
                                {this.getTab('activity')}
                            </Tabs>
                        </div>
                        <div id='projectBox' key='projectBox'>
                            <StudioContainer id={this.props.studioId} type={this.props.itemType}/>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}));

/*
items={this.state.loaded} itemType={this.props.itemType}
    showLoves={false} showFavorites={false} showViews={false} context="studio"
    */

/*{this.state.loaded.map(function (item) {
    return (
        this.props.itemType=='projects' ?
        <div>
            <ProjectContainer id={this.props.studioId} offset={this.state.offset} />
            <p>PROJECT WAI</p>
        </div>
               :
       <Thumbnail key={item.id}
                  type={this.props.itemType.substring(0,this.props.itemType.length-1)}
                  href={item.href}
                  title={item.title}
                  src={item.image}
                  context='studio'/>
    );
}.bind(this))}*/
render(<Page><Studio /></Page>, document.getElementById('app'));
