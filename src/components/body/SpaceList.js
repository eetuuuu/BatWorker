
'use strict';

var React = require('react');

import {Button,ButtonGroup, DropdownButton,MenuItem,Panel,ListGroup,Glyphicon,Tooltip,OverlayTrigger} from 'react-bootstrap';

import ValueGroup from '../util/ValueGroup.js'
import XEditableText from "../Enhanced/XEditableText.js";

var action = global.SpaceActions;
var store=global.WorkStore;
var Reflux = require('reflux');


const checkTip = (
  <Tooltip><strong>查看</strong></Tooltip>
);

const addToQueueTip = (
 <Tooltip><strong>加入队列</strong></Tooltip>
);

const runTip = (
 <Tooltip><strong>运行</strong></Tooltip>
);


//<Link to="item" params={params}>{item.name}</Link>
var ProjectItem=React.createClass({
    changeName:function(kev,value){
        var vo=this.props.data;
        vo.name=value;
    },

    onSelect:function(){
        if(this.props.onSelect){
            this.props.onSelect(this.props.idx);
        }
         var vo=this.props.data;
        action.selectSpace(vo.id);
    },

    onAddToQueue:function(){
         var vo=this.props.data;
         global.QueueActions.addToQueue(vo.id);
    },

    onRun:function(){
        var vo=this.props.data;
        global.QueueActions.runJob(vo.id);
    },

    render:function(){
        var vo=this.props.data;
        return <h4>  
                    <ButtonGroup>
                        <OverlayTrigger placement="top" overlay={checkTip}>
                        <Button bsSize="xs"  onClick={this.onSelect}><Glyphicon glyph="check" /></Button></OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={addToQueueTip}>
                        <Button bsSize="xs"  onClick={this.onAddToQueue}><Glyphicon glyph="list-alt" /></Button></OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={runTip}>
                        <Button bsSize="xs"  onClick={this.onRun}><Glyphicon glyph="play-circle" /></Button></OverlayTrigger>                         
                    </ButtonGroup>
                     <XEditableText id='protected_name' title='项目名称' val={vo.name} onChange={this.changeName}/>
                     
                </h4>
    }
});

var SpaceItem=React.createClass({
  getInitialState: function () {
    return { isOpen: false};
  },  

  toggle: function () {
    if(this.props.onSelect){
        this.props.onSelect(this.props.idx);
    }
    this.setState({ isOpen: !this.state.isOpen });
  },

  buildToggleClassName: function () {
    var toggleClassName = 'SpaceNav__Toggle';
    if (this.state.isOpen)
      toggleClassName += 'SpaceNav__Toggle--is-open';
    return toggleClassName;
  },

  renderItems: function () {
    var vo = this.props.data;
    if(this.state.isOpen==false){
        return null;
    }

        var spProps={};
        spProps.list=vo.projects;
        spProps.creator=global.cfgs.projectTmp;        
        
        spProps.renderHandler=(selectHandler)=>{
            var idx=0;
            return <div>
                        {vo.projects.map(function(item){
                            return <ProjectItem idx={idx++} data={item} onSelect={selectHandler}/>
                        })
                    }
                    </div>

        }
    return <ul><ValueGroup {...spProps}/></ul>
  },

  changeName:function(id,value){
        var vo = this.props.data;
        vo.name=value;
  },

  render: function () {
    var vo = this.props.data;
    var icon=this.state.isOpen?'triangle-bottom':'triangle-right';
    //console.log('dengyp spaceItem render');
    //console.dir(this.props);
    return (
      <div className="SpaceNav">
        <h3 className={this.buildToggleClassName()}>
            <Button bsSize="small" onClick={this.toggle}><Glyphicon glyph={icon} /></Button>
            <XEditableText id='space_name' title='空间名称' val={vo.name} onChange={this.changeName}/>
        </h3>
        {this.renderItems()}
      </div>
    );
  }
});

var SpaceList = React.createClass({

    getInitialState: function() {
        return store.workVo;
    },   

    onModelChange: function(model) {
        this.setState(model);
    },

    componentDidMount() {
        this.unsubscribe = store.listen(this.onModelChange);
    },

    componentWillUnmount() {
        this.unsubscribe();
    },
   
    onSelectMenu:function(key,href,targe){        
        action[key]();
    },

    renderMenuItem:function(item){
        var cb=function(){
            action[item.act]();
        }
        return  <Button onClick={cb}>
                    {item.label}
                </Button>
    },

    render: function() {       
        var menus=global.cfgs.spaceMenu;

        var spProps={};
        spProps.list=this.state.space;
        spProps.creator=global.cfgs.spaceTmp;
       
        spProps.renderHandler=(selectHandler)=>{
            console.log("fuck render spaces");
            console.dir(this.state);
            var idx=0;
            return <div>
                        {                            
                        this.state.space.map(function(item){
                            return <SpaceItem data={item} idx={idx++} onSelect={selectHandler}/>
                        })
                    }
                    </div>
        }
      

        return (
            <Panel {...this.props} header="工作空间" bsStyle="info">
                <ButtonGroup bsSize="small">                
                    {
                        menus.map(this.renderMenuItem)
                    }
                </ButtonGroup>
                <ValueGroup {...spProps}></ValueGroup>
            </Panel>
            );
    }
});



module.exports = SpaceList;
